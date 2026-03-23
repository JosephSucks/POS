"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Wallet, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useCart } from "../context/cart-context"
import { useTable } from "../context/table-context"
import { useTheme } from "@/components/theme-provider"

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, cartTotal, clearCart, customer, discountAmount } = useCart()
  const { selectedTable } = useTable()
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [isHydrated, setIsHydrated] = useState(false)
  
  console.log('[v0] Checkout page render - cart length:', cart.length, 'customer:', customer?.name)
  
  // Wait for cart to be populated before rendering checkout
  useEffect(() => {
    // If cart is already populated, show immediately
    if (cart.length > 0) {
      console.log('[v0] Cart already populated, showing checkout')
      setIsHydrated(true)
      return
    }
    
    // Otherwise wait up to 500ms for cart to load
    const timer = setTimeout(() => {
      console.log('[v0] Hydration timeout - cart length:', cart.length)
      setIsHydrated(true)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  const tax = cartTotal * 0.1
  const grandTotal = cartTotal - discountAmount + tax

  const handlePayment = async () => {
    try {
      console.log('[v0] Starting checkout with cart:', cart.length, 'items, customer:', customer?.name, 'discount:', discountAmount)

      const transaction = {
        customerId: customer?.id || null,
        tableId: selectedTable?.id || null,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
        })),
        subtotal: cartTotal,
        tax: tax,
        discount: discountAmount,
        total: grandTotal,
        paymentMethod: paymentMethod,
      }

      console.log('[v0] Sending transaction to API:', transaction)

      // Save transaction via API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process payment')
      }

      const result = await response.json()
      console.log('[v0] Payment successful, order ID:', result.orderId)
      
      // Build success URL with order info - BEFORE clearing cart
      const successParams = new URLSearchParams({
        orderId: result.orderId.toString(),
        total: grandTotal.toFixed(2),
        subtotal: cartTotal.toFixed(2),
        tax: tax.toFixed(2),
        discount: discountAmount.toFixed(2),
        paymentMethod: paymentMethod,
        items: JSON.stringify(cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        })))
      })
      
      const successUrl = `/success?${successParams.toString()}`
      console.log('[v0] Redirecting to success page:', successUrl)
      
      // Clear cart first
      clearCart()
      
      // Then redirect immediately using router.push (faster than window.location)
      router.push(successUrl)
    } catch (error) {
      console.error('[v0] Checkout error:', error)
      alert('Failed to process payment. Please try again.')
    }
  }

  // Show loading while cart hydrates
  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    )
  }

  // Only show empty cart if we have hydrated AND cart is actually empty
  if (cart.length === 0 && isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">Add some items to your cart before checkout</p>
          <Button className="mt-4" onClick={() => router.push("/")}>
            Return to POS
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" className="mb-6" onClick={() => router.push("/pos")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to POS
        </Button>

        <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Order Summary - Takes 2 columns on md and up */}
          <div className="md:col-span-2">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
            <div className="rounded-lg border p-6 bg-card space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-start pb-4 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p className="font-medium">${cartTotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Tax (10%)</p>
                  <p className="font-medium">${tax.toFixed(2)}</p>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <p>Discount</p>
                    <p className="font-medium">-${discountAmount.toFixed(2)}</p>
                  </div>
                )}
                <Separator className="my-3" />
                <div className="flex justify-between text-base font-bold">
                  <p>Total</p>
                  <p className="text-primary">${grandTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Payment</h2>
            <div className="rounded-lg border p-6 bg-card sticky top-8 space-y-4">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-muted transition-colors" onClick={() => setPaymentMethod('card')}>
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-3">
                    <CreditCard className="h-5 w-5" />
                    <span>Credit/Debit Card</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 rounded-md border p-4 cursor-pointer hover:bg-muted transition-colors mt-3" onClick={() => setPaymentMethod('cash')}>
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex-1 cursor-pointer flex items-center gap-3">
                    <Wallet className="h-5 w-5" />
                    <span>Cash</span>
                  </Label>
                </div>
              </RadioGroup>

              <Separator className="my-4" />

              <Button className="w-full" size="lg" onClick={handlePayment}>
                Complete Payment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
