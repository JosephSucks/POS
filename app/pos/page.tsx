"use client"

import { useState } from "react"
import { Search, Settings, ChevronDown, Menu, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import ProductGrid from "../components/product-grid"
import CartSidebar from "../components/cart-sidebar"
import CategorySidebar from "../components/category-sidebar"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showCart, setShowCart] = useState(false)
  const [showCategories, setShowCategories] = useState(false)

  const router = useRouter()

  return (
    <div className="h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Mobile: Cart Drawer */}
      <Sheet open={showCart} onOpenChange={setShowCart}>
        <SheetContent side="right" className="p-0 w-full sm:w-96">
          <CartSidebar />
        </SheetContent>
      </Sheet>

      {/* Mobile: Categories Drawer */}
      <Sheet open={showCategories} onOpenChange={setShowCategories}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <CategorySidebar 
              selectedCategory={selectedCategory} 
              onSelectCategory={(cat) => {
                setSelectedCategory(cat)
                setShowCategories(false)
              }} 
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop: Category Sidebar */}
      <div className="hidden md:flex flex-col w-56 border-r bg-background">
        <CategorySidebar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="p-4">
            {/* Mobile Header */}
            <div className="md:hidden space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h1 className="text-xl font-bold truncate">POS</h1>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowCategories(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowCart(true)}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => router.push("/admin")}
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between gap-4">
              <h1 className="text-2xl font-bold">Point of Sale</h1>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => router.push("/admin")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Area */}
        <div className="flex-1 overflow-auto p-4">
          <ProductGrid category={selectedCategory} searchQuery={searchQuery} />
        </div>
      </main>

      {/* Desktop: Cart Sidebar */}
      <div className="hidden md:flex w-96 border-l bg-background flex-col max-h-screen">
        <CartSidebar />
      </div>
    </div>
  )
}

