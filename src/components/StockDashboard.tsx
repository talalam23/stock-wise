// src/components/StockDashboard.tsx
'use client'

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { createProduct, updateStock, recordSale, generateAIReport } from "@/app/actions"
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
import { Package, AlertTriangle, ArrowUpRight, ArrowDownRight, ShoppingCart, Trash2, DollarSign, Sparkles, Loader2 } from "lucide-react"

export default function StockDashboard({ products, stats }: { products: any[], stats: any }) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSaleOpen, setIsSaleOpen] = useState(false)
  
  // Sales Cart State
  const [cart, setCart] = useState<{ productId: string; name: string; quantity: number }[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [qtyInput, setQtyInput] = useState(1)

  const [aiLoading, setAiLoading] = useState(false)
  const [aiReport, setAiReport] = useState("")

  // Helper to add items to cart
  const addToCart = () => {
    if (!selectedProduct) return
    const product = products.find(p => p.id === selectedProduct)
    if (!product) return

    setCart(prev => [...prev, { productId: product.id, name: product.name, quantity: qtyInput }])
    setQtyInput(1)
    setSelectedProduct("")
  }

  // Helper to checkout
  const handleCheckout = async () => {
    const result = await recordSale(cart)
    if (result.success) {
        setCart([])
        setIsSaleOpen(false)
    } else {
        alert("Sale failed! Check stock levels.")
    }
  }

  const getPriority = (quantity: number, minLevel: number) => {
    if (quantity === 0) return { label: "CRITICAL", color: "bg-red-500" }
    if (quantity < minLevel) return { label: "Low Stock", color: "bg-orange-500" }
    return { label: "Healthy", color: "bg-green-500" }
  }

  const handleGenerateAI = async () => {
    setAiLoading(true)
    const result = await generateAIReport()
    if (result.success && result.report) {
        setAiReport(result.report)
    } else {
        alert("AI Service Unavailable")
    }
    setAiLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* AI Insight Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center bg-linear-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-blue-100">
            <div>
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    AI Supply Chain Analyst
                </h3>
                <p className="text-sm text-blue-700">Generate real-time insights using Google Gemini 1.5 Flash</p>
            </div>
            <Button onClick={handleGenerateAI} disabled={aiLoading} className="bg-purple-600 hover:bg-purple-700">
                {aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {aiLoading ? "Analyzing Data..." : "Generate Report"}
            </Button>
        </div>

        {/* The AI Output Area */}
        {aiReport && (
            <Card className="bg-slate-50 border-purple-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Executive Summary</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none text-slate-700">
                    <ReactMarkdown>{aiReport}</ReactMarkdown>
                </CardContent>
            </Card>
        )}
      </div>
      {/* 1. KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Lifetime Sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Asset Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Action Needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productCount}</div>
            <p className="text-xs text-muted-foreground">Active SKUs</p>
          </CardContent>
        </Card>
      </div>

      {/* 2. Action Bar */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Stock Management</h2>
        
        <div className="flex gap-2">
            {/* Sales Order Button */}
            <Dialog open={isSaleOpen} onOpenChange={setIsSaleOpen}>
                <DialogTrigger asChild>
                    <Button variant="secondary" className="border"><ShoppingCart className="mr-2 h-4 w-4" /> New Sales Order</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Sales Order</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex gap-2 items-end">
                             <div className="grid gap-2 flex-1">
                                <Label>Product</Label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                >
                                    <option value="">Select Item...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                                    ))}
                                </select>
                             </div>
                             <div className="grid gap-2 w-20">
                                <Label>Qty</Label>
                                <Input 
                                    type="number" 
                                    min="1"
                                    value={qtyInput}
                                    onChange={(e) => setQtyInput(parseInt(e.target.value))}
                                />
                             </div>
                             <Button onClick={addToCart} disabled={!selectedProduct}>Add</Button>
                        </div>

                        {/* Cart List */}
                        <div className="border rounded-md p-2 min-h-25 space-y-2 bg-slate-50">
                            {cart.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Cart is empty</p>}
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-2 border rounded shadow-sm text-sm">
                                    <span>{item.name} x {item.quantity}</span>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <Button className="w-full" onClick={handleCheckout} disabled={cart.length === 0}>
                            Confirm Sale ({cart.length} Items)
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Product Button */}
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
              <TableHead>Status</TableHead>
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
                        title="Restock"
                        onClick={() => updateStock(product.id, 1, "IN", "Manual Restock")}
                    >
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline"
                        title="Sell One"
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