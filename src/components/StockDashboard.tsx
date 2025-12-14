// src/components/StockDashboard.tsx
'use client'

import { useState } from "react"
import { createProduct, updateStock } from "@/app/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function StockDashboard({ products, stats }: { products: any[], stats: any }) {
  const [isAddOpen, setIsAddOpen] = useState(false)

  // AI Logic: Simple "Restock Priority" calculation
  const getPriority = (quantity: number, minLevel: number) => {
    if (quantity === 0) return { label: "CRITICAL", color: "bg-red-500" }
    if (quantity < minLevel) return { label: "High Priority", color: "bg-orange-500" }
    if (quantity < minLevel * 1.5) return { label: "Moderate", color: "bg-yellow-500" }
    return { label: "Healthy", color: "bg-green-500" }
  }

  return (
    <div className="space-y-6">
      {/* 1. KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <p className="text-xs text-muted-foreground">$</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across {stats.productCount} SKUs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Items below minimum level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Live</div>
            <p className="text-xs text-muted-foreground">Connected to Vercel Postgres</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button><Package className="mr-2 h-4 w-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product SKU</DialogTitle>
            </DialogHeader>
            <form action={async (formData) => {
                await createProduct(formData)
                setIsAddOpen(false)
            }} className="space-y-4">
              <div className="grid gap-2">
                <Label>Product Name</Label>
                <Input name="name" required />
              </div>
              <div className="grid gap-2">
                <Label>SKU Code</Label>
                <Input name="sku" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Price ($)</Label>
                  <Input name="price" type="number" step="0.01" required />
                </div>
                <div className="grid gap-2">
                  <Label>Initial Qty</Label>
                  <Input name="quantity" type="number" required />
                </div>
              </div>
              <Button type="submit" className="w-full">Register Product</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 3. The ERP Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>AI Suggestion</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const status = getPriority(product.quantity, product.minLevel)
              return (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>${product.price}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{product.quantity}</span>
                      <span className="text-xs text-muted-foreground">/ {product.minLevel} min</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${status.color} hover:${status.color} text-white`}>
                        {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateStock(product.id, 1, "IN", "Manual Restock")}
                    >
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateStock(product.id, 1, "OUT", "Manual Sale")}
                    >
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}