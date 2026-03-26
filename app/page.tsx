"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Bold, Loader2, LogIn, ShieldCheck } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

const getReasonMessage = (reason: string | null) => {
  if (reason === "auth") {
    return "Please sign in to continue."
  }

  if (reason === "forbidden") {
    return "You do not have permission to access that page."
  }

  return ""
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const reasonMessage = useMemo(() => getReasonMessage(searchParams.get("reason")), [searchParams])

  useEffect(() => {
    let isMounted = true

    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "include" })

        if (response.ok && isMounted) {
          router.replace("/pos")
          return
        }
        // 401 is expected on login page when not authenticated yet
      } catch (error) {
        // Silently ignore errors on login page
      }

      if (isMounted) {
        setIsCheckingSession(false)
      }
    }

    checkSession()

    return () => {
      isMounted = false
    }
  }, [router])

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true)
    form.clearErrors("root")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        form.setError("root", {
          message: data.error || "Unable to sign in",
        })
        return
      }

      // Wait 1 second to ensure auth cookie is fully set before navigating
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push("/pos")
    } catch (error) {
      console.error("[auth] Login error:", error)
      form.setError("root", {
        message: "Unable to sign in right now. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const rootError = form.formState.errors.root?.message

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden flex-col justify-center text-white lg:flex">
            <div className="max-w-lg space-y-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight">Joseph POS v1 System</h1>
                <p className="text-base text-slate-300">
                  Blah blah blah, this is a demo POS system built with Next.js, React Hook Form, Zod, and Neon PostgreSQL.
                </p>
              </div>
              <div className="grid gap-4 text-sm text-slate-300">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  Email: admin@gmail.com, Password: imadmin123 (admin role)
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  Admin-only features stay protected behind role-based access.
                </div>
              </div>
            </div>
          </div>

          <Card className="w-full shadow-2xl">
            <CardHeader className="space-y-2 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <LogIn className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl">Staff Login</CardTitle>
              <CardDescription>Enter your email and password to access the POS</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                  {(reasonMessage || rootError) && (
                    <Alert variant={rootError ? "destructive" : "default"}>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{rootError || reasonMessage}</AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="name@company.com"
                            autoComplete="email"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            disabled={isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
