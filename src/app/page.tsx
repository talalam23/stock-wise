// src/app/page.tsx
import { getDashboardStats, getProducts } from "./actions"
import StockDashboard from "@/components/StockDashboard"

export const dynamic = 'force-dynamic' // Ensure real-time data (no caching)

export default async function Home() {
  const stats = await getDashboardStats()
  const products = await getProducts()

  return (
    <main className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">StockWise ERP</h1>
            <p className="text-muted-foreground">AI-Powered Inventory Management System</p>
          </div>
          <div className="text-sm text-right text-muted-foreground">
             <p>Next.js 15 • Vercel Postgres • Prisma</p>
          </div>
        </div>
        
        <StockDashboard stats={stats} products={products} />
      </div>
    </main>
  )
}