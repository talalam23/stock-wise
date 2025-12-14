// src/app/actions.ts
'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

// 1. Dashboard Stats (Updated with Revenue)
export async function getDashboardStats() {
  const products = await prisma.product.findMany()
  
  // Calculate Inventory Value
  const totalValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0)
  
  // Calculate Total Sales Revenue (New Feature)
  // We fetch all "OUT" movements and sum (qty * price)
  const salesMovements = await prisma.movement.findMany({
    where: { type: 'OUT' },
    include: { product: true }
  })
  const totalRevenue = salesMovements.reduce((acc, m) => acc + (m.quantity * m.product.price), 0)

  const lowStock = products.filter(p => p.quantity < p.minLevel).length
  
  const recentMovements = await prisma.movement.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { product: true }
  })

  return { totalValue, totalRevenue, lowStock, recentMovements, productCount: products.length }
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
      movements: {
        create: {
          type: "IN",
          quantity: quantity,
          notes: "Initial Stock"
        }
      }
    }
  })
  
  revalidatePath("/")
}

// 4. Update Stock (Single Item)
export async function updateStock(productId: string, adjustment: number, type: "IN" | "OUT" | "ADJUSTMENT", notes?: string) {
  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: { quantity: { increment: type === "OUT" ? -adjustment : adjustment } }
    })

    await tx.movement.create({
      data: { type, quantity: adjustment, productId, notes }
    })
  })
  
  revalidatePath("/")
}

// 5. Multi-Product Sales Order (Cart Logic)
export async function recordSale(items: { productId: string; quantity: number }[]) {
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        
        if (!product || product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for product ID ${item.productId}`)
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } }
        })

        await tx.movement.create({
          data: {
            type: "OUT",
            quantity: item.quantity,
            productId: item.productId,
            notes: "Sales Order"
          }
        })
      }
    })
    
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Stock error. Sale failed." }
  }
}