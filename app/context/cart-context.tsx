"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"

export interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  stock?: number
}

interface Discount {
  id: string
  type: "percentage" | "fixed"
  value: number
  description: string
  minAmount?: number
}

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  loyaltyPoints: number
  totalSpent: number
  purchaseHistory?: Transaction[]
}

interface Transaction {
  id: string
  customerId?: string
  items: CartItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  paymentMethod: string
  timestamp: Date
  receiptNumber: string
}

interface CartItem extends Product {
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  itemCount: number
  appliedDiscount: Discount | null
  applyDiscount: (discount: Discount) => void
  removeDiscount: () => void
  discountAmount: number
  customer: Customer | null
  setCustomer: (customer: Customer | null) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load cart and customer from localStorage on initial render
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        console.log('[v0] Loaded cart from localStorage:', parsedCart.length, 'items')
        setCart(parsedCart)
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
    
    const savedCustomer = localStorage.getItem("selectedCustomer")
    if (savedCustomer) {
      try {
        const parsedCustomer = JSON.parse(savedCustomer)
        console.log('[v0] Loaded customer from localStorage:', parsedCustomer.name)
        setCustomer(parsedCustomer)
      } catch (error) {
        console.error("Failed to parse customer from localStorage:", error)
      }
    }
    
    // Mark hydration as complete so we can start saving
    setIsHydrated(true)
  }, [])

  // Save cart to localStorage ONLY after hydration is complete
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart, isHydrated])

  // Save customer to localStorage ONLY after hydration is complete
  useEffect(() => {
    if (typeof window === 'undefined' || !isHydrated) return
    if (customer) {
      localStorage.setItem("selectedCustomer", JSON.stringify(customer))
    } else {
      localStorage.removeItem("selectedCustomer")
    }
  }, [customer, isHydrated])

  const addToCart = (product: Product) => {
    // Prevent adding if stock is 0 or not available
    if (!product.stock || product.stock <= 0) {
      console.log('[v0] Cannot add sold-out product:', product.name)
      return
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      
      // Check if adding would exceed available stock
      const currentQuantity = existingItem?.quantity || 0
      if (currentQuantity + 1 > product.stock) {
        console.log('[v0] Cannot exceed stock limit for:', product.name, 'Available:', product.stock, 'Requested:', currentQuantity + 1)
        return prevCart
      }

      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }

      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    // Find the product to check stock limit
    const product = cart.find(item => item.id === productId)
    if (product && quantity > (product.stock || 0)) {
      console.log('[v0] Cannot exceed stock limit. Available:', product.stock, 'Requested:', quantity)
      return
    }

    setCart((prevCart) => prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCart([])
  }

  const applyDiscount = (discount: Discount) => {
    if (discount.minAmount && cartTotal < discount.minAmount) {
      return
    }
    setAppliedDiscount(discount)
  }

  const removeDiscount = () => {
    setAppliedDiscount(null)
  }

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  const discountAmount = appliedDiscount
    ? appliedDiscount.type === "percentage"
      ? cartTotal * (appliedDiscount.value / 100)
      : appliedDiscount.value
    : 0

  const itemCount = cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        appliedDiscount,
        applyDiscount,
        removeDiscount,
        discountAmount,
        customer,
        setCustomer,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
