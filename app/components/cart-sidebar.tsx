"use client"

import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingCart, Trash2, User, Tag, AlertCircle } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCart } from "../context/cart-context"
import { useTable } from "../context/table-context"
import CustomerModal from "./customer-modal"
import DiscountModal from "./discount-modal"

export default function CartSidebar() {
  const router = useRouter()
  const { cart, removeFromCart, updateQuantity, cartTotal, itemCount, customer, appliedDiscount, discountAmount } =
    useCart()
  const { currentTableId, tables } = useTable()
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showDiscountModal, setShowDiscountModal] = useState(false)

  const selectedTable = tables.find((t) => t.id === currentTableId)

  const handleCheckout = () => {
    router.push("/checkout")
  }

  return (
    <div className="flex w-80 flex-col border-l bg-background">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="flex items-center text-lg font-semibold">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Cart
        </h2>
        <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
          {itemCount} items
        </span>
      </div>

      {selectedTable && (
        <div className="border-b bg-blue-50 dark:bg-blue-950 p-3">
          <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
            📍 Table {selectedTable.table_number} ({selectedTable.capacity} seats)
          </p>
        </div>
      )}

      {/* Customer Section */}
      <div className="border-b p-4">
        <Button
          variant="outline"
          className="w-full justify-start bg-transparent"
          onClick={() => setShowCustomerModal(true)}
        >
          <User className="mr-2 h-4 w-4" />
          {customer ? customer.name : "Select Customer"}
        </Button>
      </div>

      {/* Discount Section */}
      <div className="border-b p-4">
        <Button
          variant="outline"
          className="w-full justify-start bg-transparent"
          onClick={() => setShowDiscountModal(true)}
        >
          <Tag className="mr-2 h-4 w-4" />
          {appliedDiscount ? appliedDiscount.description : "Apply Discount"}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {cart.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <ShoppingCart className="mb-2 h-12 w-12 text-muted-foreground" />
            <h3 className="font-medium">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground">Add items to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                  <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <h3 className="font-medium line-clamp-1">{item.name}</h3>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 bg-transparent"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between">
            <p>Subtotal</p>
            <p>${cartTotal.toFixed(2)}</p>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <p>Discount</p>
              <p>-${discountAmount.toFixed(2)}</p>
            </div>
          )}
          <div className="flex justify-between font-medium">
            <p>Total</p>
            <p>${(cartTotal - discountAmount).toFixed(2)}</p>
          </div>
        </div>
        {cart.length > 0 && !selectedTable && (
          <Alert className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-xs text-yellow-800 dark:text-yellow-200">
              Please select a table to proceed with checkout
            </AlertDescription>
          </Alert>
        )}
        <Button className="w-full" size="lg" disabled={cart.length === 0 || !selectedTable} onClick={handleCheckout}>
          Checkout
        </Button>
      </div>
      <CustomerModal isOpen={showCustomerModal} onClose={() => setShowCustomerModal(false)} />
      <DiscountModal isOpen={showDiscountModal} onClose={() => setShowDiscountModal(false)} />
    </div>
  )
}
