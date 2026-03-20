"use client"

import { useState, useEffect, useRef } from "react"
import { Lock, ShieldCheck, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface AdminPinLockProps {
  children: React.ReactNode
}

export default function AdminPinLock({ children }: AdminPinLockProps) {
  const [isLocked, setIsLocked] = useState(true)
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isPinEnabled, setIsPinEnabled] = useState(false)
  const [storedPin, setStoredPin] = useState("1234")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Load PIN settings from database
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        const settings = await response.json()
        
        console.log('[v0] Loaded settings from API:', settings)
        
        const adminPinEnabled = settings.adminPinEnabled || true // Default to true
        const adminPin = settings.adminPin || "1234"
        
        console.log('[v0] Parsed PIN - enabled:', adminPinEnabled, 'PIN:', adminPin, 'type:', typeof adminPin)
        
        setIsPinEnabled(adminPinEnabled)
        setStoredPin(String(adminPin)) // Ensure it's a string
        
        // Check if already authenticated in this session
        const sessionAuth = sessionStorage.getItem('admin-authenticated')
        if (sessionAuth === 'true') {
          setIsLocked(false)
        } else if (adminPinEnabled) {
          setIsLocked(true)
        } else {
          setIsLocked(false)
        }
      } catch (error) {
        console.error('[v0] Failed to load PIN settings:', error)
        // Fallback to defaults
        setIsPinEnabled(true)
        setStoredPin("1234")
        setIsLocked(true)
      }
    }
    
    loadSettings()
  }, [])

  useEffect(() => {
    // Focus input when locked
    if (isLocked && isPinEnabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLocked, isPinEnabled])

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('[v0] PIN submission - entered:', pin, 'stored:', storedPin, 'match:', pin === storedPin)
    
    if (pin === storedPin) {
      console.log('[v0] PIN correct!')
      setIsLocked(false)
      setError("")
      sessionStorage.setItem('admin-authenticated', 'true')
    } else {
      console.log('[v0] PIN incorrect!')
      setError("Incorrect PIN. Please try again.")
      setPin("")
      inputRef.current?.focus()
    }
  }

  const handlePinChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setPin(numericValue)
    setError("")
    
    // Auto-submit if PIN is complete (matches stored PIN length)
    if (numericValue.length === storedPin.length && numericValue === storedPin) {
      setIsLocked(false)
      sessionStorage.setItem('admin-authenticated', 'true')
    }
  }

  // If PIN is not enabled, render children directly
  if (!isPinEnabled) {
    return <>{children}</>
  }

  // If locked, show PIN entry screen
  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        {/* Responsive Back Button - Top Left */}
        <Button 
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10"
          onClick={() => router.push("/pos")}
          title="Back to POS"
        >
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
        </Button>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>Enter your PIN to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  ref={inputRef}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="text-center text-2xl tracking-widest h-14"
                  maxLength={6}
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" size="lg" disabled={pin.length < 4}>
                <ShieldCheck className="h-5 w-5 mr-2" />
                Unlock
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Contact your manager if you forgot the PIN
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
