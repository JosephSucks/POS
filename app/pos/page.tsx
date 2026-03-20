"use client"

import { useState } from "react"
import { Search, Settings, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"
import ProductGrid from "../components/product-grid"
import CartSidebar from "../components/cart-sidebar"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useCart } from "../context/cart-context"

const CATEGORIES = [
  { id: "all", name: "All Products", icon: "🏪" },
  { id: "food", name: "Food", icon: "🍔" },
  { id: "drinks", name: "Drinks", icon: "🥤" },
  { id: "desserts", name: "Desserts", icon: "🍰" },
]

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showCart, setShowCart] = useState(false)
  const { cart, itemCount } = useCart()
  const cartCount = itemCount

  const router = useRouter()

  return (
    <div className="h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Mobile: Cart Sheet */}
      <Sheet open={showCart} onOpenChange={setShowCart}>
        <SheetContent side="right" className="p-0 w-full sm:w-96 flex flex-col pt-12">
          <div className="sr-only">
            <h2>Cart</h2>
          </div>
          <CartSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop: Category Sidebar */}
      <aside className="hidden md:flex md:w-56 lg:w-64 flex-col border-r bg-card/50">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold tracking-tight">Categories</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="truncate text-sm">{cat.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Compact Header */}
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b">
          <div className="px-4 py-3 md:px-6 md:py-4 space-y-3 md:space-y-0">
            {/* Top Row: Menu + Search + Cart */}
            <div className="flex items-center justify-between gap-3">
              {/* Left: Search */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 pr-3 bg-muted border-0 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Right: Cart + Settings */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button 
                  variant="ghost"
                  size="icon"
                  className="md:hidden relative"
                  onClick={() => setShowCart(true)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/admin")}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Mobile: Category Tabs */}
            <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-1 w-max">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full font-medium transition-all text-sm flex items-center gap-1.5 flex-shrink-0 ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Products Grid */}
        <div className="flex-1 overflow-auto">
          <div className="px-4 py-6 md:px-6 md:py-8">
            <ProductGrid category={selectedCategory} searchQuery={searchQuery} />
          </div>
        </div>
      </main>

      {/* Desktop: Cart Sidebar */}
      <aside className="hidden md:flex w-80 lg:w-96 border-l bg-card/50 flex-col overflow-hidden">
        <CartSidebar />
      </aside>
    </div>
  )
}

