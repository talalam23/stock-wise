// src/app/actions.ts
'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

// 1. Dashboard Stats (The "BI" part)
export async function getDashboardStats() {
  const products = await prisma.product.findMany()
  
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0)
  const lowStock = products.filter(p => p.quantity < p.minLevel).length
  const recentMovements = await prisma.movement.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { product: true } // Join table
  })

  return { totalValue, lowStock, recentMovements, productCount: products.length }
}

// 2. Get Inventory
export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: { name: 'asc' }
  })
}

// 3. Add New Product
export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string
  const sku = formData.get("sku") as string
  const price = parseFloat(formData.get("price") as string)
  const quantity = parseInt(formData.get("quantity") as string)

  await prisma.product.create({
    data: {
      name,
      sku,
      price,
      quantity,
      // Create initial movement record for history
      movements: {
        create: {
          type: "IN",
          quantity: quantity,
          notes: "Initial Stock"
        }
      }
    }
  })
  
  revalidatePath("/") // Refresh the UI
}

// 4. The ERP Logic: Transactional Stock Adjustment
export async function updateStock(productId: string, adjustment: number, type: "IN" | "OUT" | "ADJUSTMENT", notes?: string) {
  // Use a transaction to ensure data integrity
  await prisma.$transaction(async (tx) => {
    // 1. Update the Product count
    await tx.product.update({
      where: { id: productId },
      data: {
        quantity: {
          increment: type === "OUT" ? -adjustment : adjustment
        }
      }
    })

    // 2. Log the Movement (History)
    await tx.movement.create({
      data: {
        type,
        quantity: adjustment,
        productId,
        notes
      }
    })
  })
  
  revalidatePath("/")
}