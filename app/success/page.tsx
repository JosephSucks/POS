"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, Printer, CreditCard, Banknote, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface OrderItem {
  name: string
  quantity: number
  price: number
  total: number
}

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [orderData, setOrderData] = useState<{
    orderId: string
    total: number
    subtotal: number
    tax: number
    discount: number
    paymentMethod: string
    items: OrderItem[]
  } | null>(null)

  const date = new Date().toLocaleString()

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    const total = searchParams.get('total')
    const subtotal = searchParams.get('subtotal')
    const tax = searchParams.get('tax')
    const discount = searchParams.get('discount')
    const paymentMethod = searchParams.get('paymentMethod')
    const itemsParam = searchParams.get('items')
    
    if (!orderId || !total) {
      router.push("/")
      return
    }
    
    let items: OrderItem[] = []
    try {
      items = itemsParam ? JSON.parse(itemsParam) : []
    } catch (e) {
      items = []
    }
    
    setOrderData({
      orderId,
      total: parseFloat(total),
      subtotal: parseFloat(subtotal || '0'),
      tax: parseFloat(tax || '0'),
      discount: parseFloat(discount || '0'),
      paymentMethod: paymentMethod || 'cash',
      items
    })
  }, [searchParams, router])

  const handleBackToPOS = () => {
    router.push("/")
  }

  const handlePrint = () => {
    window.print()
  }

  if (!orderData) {
    return null
  }
  
  const status = orderData.paymentMethod === 'cash' ? 'completed' : 'pending'
  const statusConfig = status === 'completed' 
    ? { label: 'Completed', color: 'bg-green-100 text-green-800' }
    : { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-md">
      <div className="rounded-lg border p-6 print:border-none bg-card">
        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold">Payment Successful</h1>
        <p className="mb-6 text-center text-muted-foreground">Thank you for your purchase!</p>

        <div className="mb-6 text-center">
          <p className="font-medium">Order #{orderData.orderId}</p>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
        
        {/* Payment Method and Status */}
        <div className="mb-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            {orderData.paymentMethod === 'card' ? (
              <CreditCard className="h-4 w-4 text-blue-600" />
            ) : (
              <Banknote className="h-4 w-4 text-green-600" />
            )}
            <span className="text-sm font-medium capitalize">{orderData.paymentMethod}</span>
          </div>
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          {orderData.items.map((item, index) => (
            <div key={index} className="flex justify-between">
              <div>
                <p>
                  {item.name} × {item.quantity}
                </p>
              </div>
              <p>${item.total.toFixed(2)}</p>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          <div className="flex justify-between">
            <p>Subtotal</p>
            <p>${orderData.subtotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between">
            <p>Tax (10%)</p>
            <p>${orderData.tax.toFixed(2)}</p>
          </div>
          {orderData.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <p>Discount</p>
              <p>-${orderData.discount.toFixed(2)}</p>
            </div>
          )}
          <div className="flex justify-between font-bold">
            <p>Total</p>
            <p>${orderData.total.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 print:hidden">
          <Button onClick={handlePrint} variant="outline" className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          <Button onClick={handleBackToPOS} className="w-full">
            Go Back to POS
          </Button>
        </div>
      </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
