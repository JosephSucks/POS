"use client"

import { useState, useEffect } from "react"
import { 
  Store, 
  Receipt, 
  Printer, 
  Moon, 
  Sun, 
  Bell, 
  DollarSign, 
  Percent,
  Save,
  RefreshCw,
  CreditCard,
  Banknote,
  Clock,
  Globe,
  Shield,
  Lock,
  Eye,
  EyeOff
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTheme } from "@/app/components/theme-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

interface Settings {
  // Store Info
  storeName: string
  storeAddress: string
  storePhone: string
  storeEmail: string
  
  // Tax & Payment
  taxRate: number
  currency: string
  acceptCash: boolean
  acceptCard: boolean
  
  // Receipt
  receiptHeader: string
  receiptFooter: string
  showLogo: boolean
  autoPrintReceipt: boolean
  
  // Appearance
  darkMode: boolean
  compactMode: boolean
  
  // Notifications
  lowStockAlert: boolean
  lowStockThreshold: number
  orderNotifications: boolean
  soundEnabled: boolean
  
  // Operations
  autoCompleteOrder: boolean
  requireCustomer: boolean
  defaultPaymentMethod: string
  sessionTimeout: number
  
  // Security
  adminPinEnabled: boolean
  adminPin: string
}

const defaultSettings: Settings = {
  storeName: "My Restaurant",
  storeAddress: "123 Main Street, City, Country",
  storePhone: "+1 234 567 8900",
  storeEmail: "contact@myrestaurant.com",
  
  taxRate: 10,
  currency: "USD",
  acceptCash: true,
  acceptCard: true,
  
  receiptHeader: "Thank you for dining with us!",
  receiptFooter: "Please come again!",
  showLogo: true,
  autoPrintReceipt: false,
  
  darkMode: false,
  compactMode: false,
  
  lowStockAlert: true,
  lowStockThreshold: 10,
  orderNotifications: true,
  soundEnabled: true,
  
  autoCompleteOrder: false,
  requireCustomer: false,
  defaultPaymentMethod: "cash",
  sessionTimeout: 30,
  
  adminPinEnabled: false,
  adminPin: "1234",
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('pos-settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error('Failed to parse settings:', e)
      }
    }
  }, [])

  useEffect(() => {
    // Sync dark mode with theme provider
    if (settings.darkMode && theme !== 'dark') {
      setTheme('dark')
    } else if (!settings.darkMode && theme !== 'light') {
      setTheme('light')
    }
  }, [settings.darkMode, theme, setTheme])

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      localStorage.setItem('pos-settings', JSON.stringify(settings))
      setHasChanges(false)
      // Show success feedback
      setTimeout(() => setSaving(false), 500)
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings(defaultSettings)
      localStorage.removeItem('pos-settings')
      setHasChanges(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your POS system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700">
          You have unsaved changes
        </Badge>
      )}

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="store" className="gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Store</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="receipt" className="gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Receipt</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Sun className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
              <CardDescription>Basic information about your restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={settings.storeName}
                    onChange={(e) => updateSetting('storeName', e.target.value)}
                    placeholder="My Restaurant"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <Input
                    id="storePhone"
                    value={settings.storePhone}
                    onChange={(e) => updateSetting('storePhone', e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeAddress">Address</Label>
                <Input
                  id="storeAddress"
                  value={settings.storeAddress}
                  onChange={(e) => updateSetting('storeAddress', e.target.value)}
                  placeholder="123 Main Street, City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeEmail">Email</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => updateSetting('storeEmail', e.target.value)}
                  placeholder="contact@myrestaurant.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Operations
              </CardTitle>
              <CardDescription>Control how orders and sales are processed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-complete Cash Orders</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically mark cash orders as completed after checkout
                  </p>
                </div>
                <Switch
                  checked={settings.autoCompleteOrder}
                  onCheckedChange={(checked) => updateSetting('autoCompleteOrder', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Customer Selection</Label>
                  <p className="text-sm text-muted-foreground">
                    Require selecting a customer before completing orders
                  </p>
                </div>
                <Switch
                  checked={settings.requireCustomer}
                  onCheckedChange={(checked) => updateSetting('requireCustomer', checked)}
                />
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="480"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value) || 30)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Tax Settings
              </CardTitle>
              <CardDescription>Configure tax rates and currency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => updateSetting('taxRate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="SGD">SGD (S$)</SelectItem>
                      <SelectItem value="MYR">MYR (RM)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>Enable or disable payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Banknote className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <Label>Cash Payments</Label>
                    <p className="text-sm text-muted-foreground">Accept cash as payment</p>
                  </div>
                </div>
                <Switch
                  checked={settings.acceptCash}
                  onCheckedChange={(checked) => updateSetting('acceptCash', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <Label>Card Payments</Label>
                    <p className="text-sm text-muted-foreground">Accept credit/debit cards</p>
                  </div>
                </div>
                <Switch
                  checked={settings.acceptCard}
                  onCheckedChange={(checked) => updateSetting('acceptCard', checked)}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Default Payment Method</Label>
                <Select value={settings.defaultPaymentMethod} onValueChange={(value) => updateSetting('defaultPaymentMethod', value)}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipt Settings */}
        <TabsContent value="receipt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Receipt Configuration
              </CardTitle>
              <CardDescription>Customize your receipt appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receiptHeader">Receipt Header Message</Label>
                <Textarea
                  id="receiptHeader"
                  value={settings.receiptHeader}
                  onChange={(e) => updateSetting('receiptHeader', e.target.value)}
                  placeholder="Thank you for dining with us!"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptFooter">Receipt Footer Message</Label>
                <Textarea
                  id="receiptFooter"
                  value={settings.receiptFooter}
                  onChange={(e) => updateSetting('receiptFooter', e.target.value)}
                  placeholder="Please come again!"
                  rows={2}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Logo on Receipt</Label>
                  <p className="text-sm text-muted-foreground">Display store logo at top of receipt</p>
                </div>
                <Switch
                  checked={settings.showLogo}
                  onCheckedChange={(checked) => updateSetting('showLogo', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Printing
              </CardTitle>
              <CardDescription>Configure receipt printing options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-print Receipt</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically print receipt after each successful order
                  </p>
                </div>
                <Switch
                  checked={settings.autoPrintReceipt}
                  onCheckedChange={(checked) => updateSetting('autoPrintReceipt', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Theme
              </CardTitle>
              <CardDescription>Customize the look and feel of your POS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 dark:bg-yellow-400">
                    <Moon className="h-5 w-5 text-white dark:text-gray-900" />
                  </div>
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
                  </div>
                </div>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => {
                    updateSetting('darkMode', checked)
                    setTheme(checked ? 'dark' : 'light')
                  }}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Reduce spacing for more content on screen
                  </p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alerts & Notifications
              </CardTitle>
              <CardDescription>Configure system alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when inventory is running low
                  </p>
                </div>
                <Switch
                  checked={settings.lowStockAlert}
                  onCheckedChange={(checked) => updateSetting('lowStockAlert', checked)}
                />
              </div>
              {settings.lowStockAlert && (
                <div className="ml-4 space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.lowStockThreshold}
                    onChange={(e) => updateSetting('lowStockThreshold', parseInt(e.target.value) || 10)}
                    className="w-24"
                  />
                  <p className="text-xs text-muted-foreground">
                    Alert when stock falls below this number
                  </p>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notifications for new orders
                  </p>
                </div>
                <Switch
                  checked={settings.orderNotifications}
                  onCheckedChange={(checked) => updateSetting('orderNotifications', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">
                    Play sounds for notifications and actions
                  </p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Admin PIN Lock
              </CardTitle>
              <CardDescription>Require a PIN to access the admin panel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <Label>Enable Admin PIN</Label>
                    <p className="text-sm text-muted-foreground">
                      Require PIN entry to access admin dashboard
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.adminPinEnabled}
                  onCheckedChange={(checked) => updateSetting('adminPinEnabled', checked)}
                />
              </div>
              
              {settings.adminPinEnabled && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="adminPin">Admin PIN (4-6 digits)</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="adminPin"
                          type={showPin ? "text" : "password"}
                          value={settings.adminPin}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                            updateSetting('adminPin', value)
                          }}
                          placeholder="Enter PIN"
                          maxLength={6}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPin(!showPin)}
                        >
                          {showPin ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Staff will need to enter this PIN to access admin pages. Default: 1234
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">Security Note</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    The admin PIN provides basic protection against accidental access. For sensitive data,
                    consider implementing proper authentication.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
