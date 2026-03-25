"use client"

import { useState, useEffect } from "react"
import { Search, Plus, User, Phone, Mail, Award, Crown, X } from "lucide-react"
import { getCustomerRank, getRankProgress } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "../context/cart-context"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  loyaltyPoints: number
  totalSpent: number
}

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CustomerModal({ isOpen, onClose }: CustomerModalProps) {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const { customer, setCustomer } = useCart()

  useEffect(() => {
    if (isOpen) {
      loadCustomers()
    }
  }, [isOpen])

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const allCustomers = await response.json()
      // Map database fields to component interface
      const mappedCustomers = allCustomers.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email || '',
        phone: c.phone || '',
        loyaltyPoints: c.loyalty_points || 0,
        totalSpent: Number(c.total_spent) || 0,
      }))
      setCustomers(mappedCustomers)
    } catch (error) {
      console.error('Error loading customers:', error)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      try {
        const response = await fetch(`/api/customers?search=${encodeURIComponent(query)}`)
        const results = await response.json()
        const mappedResults = results.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email || '',
          phone: c.phone || '',
          loyaltyPoints: c.loyalty_points || 0,
          totalSpent: Number(c.total_spent) || 0,
        }))
        setCustomers(mappedResults)
      } catch (error) {
        console.error('Error searching customers:', error)
      }
    } else {
      loadCustomers()
    }
  }

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.email) return

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      })
      
      if (response.ok) {
        setNewCustomer({ name: "", email: "", phone: "" })
        setShowAddForm(false)
        loadCustomers()
      } else {
        console.error('Error adding customer:', response.statusText)
      }
    } catch (error) {
      console.error('Error adding customer:', error)
    }
  }

  const handleSelectCustomer = (selectedCustomer: Customer) => {
    setCustomer(selectedCustomer)
    toast({
      title: "Customer Selected",
      description: `${selectedCustomer.name} has been selected for this transaction.`,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Customer Management</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Add New Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddCustomer}>Save Customer</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex-1 overflow-auto space-y-2">
          {customer && (
            <Card className="border-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">Current Customer</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive md:hidden flex-shrink-0" onClick={() => setCustomer(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="hidden md:inline-flex flex-shrink-0" onClick={() => setCustomer(null)}>
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {customers.map((cust) => {
            const { currentRank, progressPercent, amountToNextRank } = getRankProgress(cust.totalSpent || 0)
            return (
              <Card key={cust.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleSelectCustomer(cust)}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center border-2 ${currentRank.bgColor} ${currentRank.borderColor}`}>
                      <Crown className={`h-4 w-4 ${currentRank.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{cust.name}</p>
                        <Badge className={`text-xs ${currentRank.bgColor} ${currentRank.color} border ${currentRank.borderColor}`}>
                          {currentRank.name}
                        </Badge>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{cust.email}</span>
                        </p>
                        {cust.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            {cust.phone}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {cust.loyaltyPoints} pts
                        </Badge>
                        <span className="text-xs font-medium">${(cust.totalSpent ?? 0).toFixed(2)} spent</span>
                      </div>
                      {currentRank.nextRank && (
                        <div className="mt-2 space-y-1">
                          <Progress value={progressPercent} className="h-1" />
                          <p className="text-xs text-muted-foreground">
                            ${amountToNextRank.toFixed(0)} to {currentRank.nextRank}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {customers.length === 0 && <div className="text-center py-8 text-muted-foreground">No customers found</div>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
