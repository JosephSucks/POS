"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LogIn, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if already logged in
    const isLoggedIn = localStorage.getItem('pos-logged-in')
    if (isLoggedIn === 'true') {
      router.push('/tables')
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Simple authentication - in a real system, validate against a backend
      // For now, accept any non-empty username/password combo
      if (!username.trim() || !password.trim()) {
        setError("Please enter both username and password")
        setIsLoading(false)
        return
      }

      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 500))

      // Store login state in localStorage and cookie
      localStorage.setItem('pos-logged-in', 'true')
      localStorage.setItem('pos-username', username)

      // Also set cookie for middleware to check
      document.cookie = 'pos-logged-in=true; path=/'

      // Redirect to Tables for table selection
      router.push('/tables')
    } catch (err) {
      console.error('[v0] Login error:', err)
      setError("Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('pos-logged-in')
    localStorage.removeItem('pos-username')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Joseph POS System</CardTitle>
          <CardDescription>Enter your credentials to access the Point of Sale</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-4">
              For demo purposes, enter any username and password
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
