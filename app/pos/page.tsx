"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, LogOut, Moon, Search, ShoppingCart, Sun } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ProductGrid from "../components/product-grid"
import CartSidebar from "../components/cart-sidebar"
import { useCart } from "../context/cart-context"
import { useTheme } from "../components/theme-provider"
import { AdminAccessRequestButton } from "@/components/admin-access-request-button"
import type { AuthUser } from "@/lib/auth"

interface AuthResponse {
  user: AuthUser
  temporaryAdminAccess?: boolean
  managerAccessControlEnabled?: boolean
}

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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [managerAccessControlEnabled, setManagerAccessControlEnabled] = useState(false)
  const [temporaryAdminAccess, setTemporaryAdminAccess] = useState(false)
  const [accessRequestStatus, setAccessRequestStatus] = useState<"pending" | "approved" | "denied" | null>(null)
  const { itemCount } = useCart()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" })
        const data: AuthResponse | null = await response.json().catch(() => null)
        if (data?.user) {
          setCurrentUser(data.user)
          setManagerAccessControlEnabled(data.managerAccessControlEnabled || false)
          setTemporaryAdminAccess(data.temporaryAdminAccess || false)
        }
      } catch (error) {
        console.error("[auth] Failed to load current user:", error)
      }
    }

    loadCurrentUser()
    // Refresh access status every 30 seconds for managers
    const interval = setInterval(loadCurrentUser, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      router.push("/")
      window.location.reload()
    } catch (error) {
      console.error("[auth] Logout failed:", error)
      setIsLoggingOut(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
      case "manager":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100"
    }
  }

  const handleThemeToggle = async () => {
    const newDarkMode = theme === "light"
    toggleTheme()

    try {
      await fetch("/api/settings/update-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ darkMode: newDarkMode }),
      })
    } catch (error) {
      console.error("Failed to save theme setting:", error)
    }
  }

  const reasonMessage = useMemo(() => {
    return searchParams.get("reason") === "forbidden"
      ? "You do not have permission to access the admin area."
      : ""
  }, [searchParams])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background md:flex-row">
      <Sheet open={showCart} onOpenChange={setShowCart}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:w-96">
          <div className="sr-only">
            <h2>Cart</h2>
          </div>
          <CartSidebar />
        </SheetContent>
      </Sheet>

      <aside className="hidden flex-col border-r bg-card/50 md:flex md:w-56 lg:w-64">
        <div className="border-b p-6">
          <h2 className="text-lg font-bold tracking-tight">Categories</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-2 p-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="mr-3 text-xl">{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur-sm">
          <div className="space-y-3 px-4 py-3 md:px-6 md:py-4">
            {reasonMessage && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{reasonMessage}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between gap-2 md:gap-3">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="border-0 bg-muted pl-9 pr-3 text-sm"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <div className="flex flex-shrink-0 items-center gap-1 md:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 md:hidden"
                  onClick={() => setShowCart(true)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {itemCount > 0 && (
                    <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center p-0 text-xs">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 md:h-9 md:w-9"
                  onClick={handleThemeToggle}
                  title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                >
                  {theme === "light" ? <Moon className="h-4 w-4 md:h-5 md:w-5" /> : <Sun className="h-4 w-4 md:h-5 md:w-5" />}
                </Button>

                {currentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2 h-8 md:h-9">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-start text-left max-w-[150px] hidden sm:block">
                            <span className="text-xs font-medium truncate">{currentUser.name}</span>
                            <Badge variant="secondary" className={`text-xs ${getRoleBadgeColor(currentUser.role)} ml-1`}>
                              {currentUser.role}
                            </Badge>
                          </div>
                          <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold sm:hidden">
                            {currentUser.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5 text-sm">
                        <p className="font-medium">{currentUser.name}</p>
                        <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      {currentUser.role === "admin" && (
                        <>
                          <DropdownMenuItem asChild>
                            <button onClick={() => router.push("/admin")} className="w-full cursor-pointer">
                              Admin Panel
                            </button>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {currentUser.role === "manager" && (
                        <>
                          {managerAccessControlEnabled ? (
                            <>
                              <DropdownMenuItem asChild>
                                <div className="w-full">
                                  <AdminAccessRequestButton
                                    controlEnabled={managerAccessControlEnabled}
                                    currentStatus={accessRequestStatus}
                                  />
                                </div>
                              </DropdownMenuItem>
                              {temporaryAdminAccess && (
                                <DropdownMenuItem asChild>
                                  <button onClick={() => router.push("/admin")} className="w-full cursor-pointer text-green-600 dark:text-green-400">
                                    Admin Panel (Temporary)
                                  </button>
                                </DropdownMenuItem>
                              )}
                            </>
                          ) : (
                            <>
                              <DropdownMenuItem asChild>
                                <button onClick={() => router.push("/admin")} className="w-full cursor-pointer">
                                  Admin Panel
                                </button>
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem asChild>
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full cursor-pointer text-red-600 dark:text-red-400"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          {isLoggingOut ? "Logging out..." : "Logout"}
                        </button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {currentUser?.role === "admin" && null}
              </div>
            </div>

            <div className="scrollbar-hide -mx-4 overflow-x-auto px-4 md:hidden">
              <div className="flex w-max gap-2 pb-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                  >
                    <span className="mr-1.5">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="px-4 py-6 md:px-6 md:py-8">
            <ProductGrid category={selectedCategory} searchQuery={searchQuery} />
          </div>
        </div>
      </main>

      <aside className="hidden w-80 flex-col overflow-hidden border-l bg-card/50 md:flex lg:w-96">
        <CartSidebar />
      </aside>
    </div>
  )
}
