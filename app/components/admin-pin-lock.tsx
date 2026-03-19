"use client"

import { useState, useEffect, useRef } from "react"
import { Lock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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

  useEffect(() => {
    // Check if PIN is enabled and if already authenticated
    const settings = localStorage.getItem('pos-settings')
    if (settings) {
      try {
        const parsed = JSON.parse(settings)
        setIsPinEnabled(parsed.adminPinEnabled || false)
        setStoredPin(parsed.adminPin || "1234")
        
        // Check if already authenticated in this session
        const sessionAuth = sessionStorage.getItem('admin-authenticated')
        if (sessionAuth === 'true') {
          setIsLocked(false)
        }
      } catch (e) {
        console.error('Failed to parse settings:', e)
      }
    } else {
      setIsPinEnabled(false)
    }
  }, [])

  useEffect(() => {
    // Focus input when locked
    if (isLocked && isPinEnabled && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLocked, isPinEnabled])

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (pin === storedPin) {
      setIsLocked(false)
      setError("")
      sessionStorage.setItem('admin-authenticated', 'true')
    } else {
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
