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
  const [receiptSettings, setReceiptSettings] = useState<any>(null)
  
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
    // Load receipt settings
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        const settings = await response.json()
        setReceiptSettings(settings)
      } catch (error) {
        console.error('Failed to load receipt settings:', error)
        setReceiptSettings(null)
      }
    }
    loadSettings()
  }, [])

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    const total = searchParams.get('total')
    const subtotal = searchParams.get('subtotal')
    const tax = searchParams.get('tax')
    const discount = searchParams.get('discount')
    const paymentMethod = searchParams.get('paymentMethod')
    const itemsParam = searchParams.get('items')
    
    if (!orderId || !total) {
      router.push("/pos")
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
    router.push("/pos")
  }

  const handlePrint = () => {
    window.print()
  }

  if (!orderData) {
    return null
  }
  
  const status = orderData.paymentMethod === 'cash' ? 'completed' : 'pending'

  return (
    <div className="min-h-screen bg-background py-8 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
      <div className="rounded-lg border shadow-lg p-6 print:border-none print:shadow-none bg-card">
        {/* Receipt Header with Logo */}
        <div className="mb-6 text-center print:mb-4">
          {receiptSettings?.showLogo && (
            <div className="mb-3 text-2xl font-bold">🏪</div>
          )}
          <h2 className="text-sm font-semibold">{receiptSettings?.storeName || 'POS System'}</h2>
          {receiptSettings?.storeAddress && (
            <p className="text-xs text-muted-foreground">{receiptSettings.storeAddress}</p>
          )}
          {receiptSettings?.storePhone && (
            <p className="text-xs text-muted-foreground">{receiptSettings.storePhone}</p>
          )}
        </div>

        {/* Custom Receipt Header Message */}
        {receiptSettings?.receiptHeader && (
          <div className="mb-4 border-t border-b py-3 text-center">
            <p className="text-xs italic text-muted-foreground">{receiptSettings.receiptHeader}</p>
          </div>
        )}

        <div className="mb-6 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold">Payment Successful</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">Thank you for your purchase!</p>

        <div className="mb-6 text-center">
          <p className="font-medium text-sm">Order #{orderData.orderId}</p>
          <p className="text-xs text-muted-foreground mt-1">{date}</p>
        </div>
        
        {/* Payment Method and Status */}
        <div className="mb-6 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2">
            {orderData.paymentMethod === 'card' ? (
              <CreditCard className="h-4 w-4 text-blue-600" />
            ) : (
              <Banknote className="h-4 w-4 text-green-600" />
            )}
            <span className="text-sm font-medium capitalize">{orderData.paymentMethod}</span>
          </div>
          <Badge className={status === 'completed' 
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
          }>
            {status === 'completed' ? 'Completed' : 'Pending'}
          </Badge>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2">
          {orderData.items.map((item, index) => (
            <div key={index} className="flex justify-between text-xs">
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

        <div className="space-y-2 text-xs">
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
          <div className="flex justify-between font-bold text-sm">
            <p>Total</p>
            <p>${orderData.total.toFixed(2)}</p>
          </div>
        </div>

        {/* Custom Receipt Footer Message */}
        {receiptSettings?.receiptFooter && (
          <div className="mt-6 border-t pt-3 text-center">
            <p className="text-xs italic text-muted-foreground">{receiptSettings.receiptFooter}</p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 print:hidden">
          <Button onClick={handlePrint} variant="outline" className="w-full text-sm">
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
          <Button onClick={handleBackToPOS} className="w-full text-sm">
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
