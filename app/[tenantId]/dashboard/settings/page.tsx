"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Save, Upload, CreditCard } from "lucide-react"

export default function SettingsPage({ params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId

  // In a real implementation, you would fetch this data from your backend
  const [tenantSettings, setTenantSettings] = useState({
    name: "Demo Company",
    description: "A vehicle assessment company",
    email: "contact@democompany.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, USA",
    logo: null,
    enableNotifications: true,
    enableCalendarSync: true,
    enableAutomaticReminders: true,
    stripeConnected: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setTenantSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setTenantSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSave = () => {
    // In a real implementation, you would save this data to your backend
    console.log("Saving tenant settings:", tenantSettings)
    alert("Settings saved successfully!")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" name="name" value={tenantSettings.name} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={tenantSettings.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={tenantSettings.email} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" value={tenantSettings.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" name="address" value={tenantSettings.address} onChange={handleChange} rows={2} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Company Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                    {tenantSettings.logo ? (
                      <img
                        src={(tenantSettings.logo as string) || "/placeholder.svg"}
                        alt="Company Logo"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-muted-foreground">No logo</span>
                    )}
                  </div>
                  <Button variant="outline" type="button">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications for important events</p>
                </div>
                <Switch
                  id="enableNotifications"
                  checked={tenantSettings.enableNotifications}
                  onCheckedChange={(checked) => handleSwitchChange("enableNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableCalendarSync">Calendar Sync</Label>
                  <p className="text-sm text-muted-foreground">Sync bookings with your Google Calendar</p>
                </div>
                <Switch
                  id="enableCalendarSync"
                  checked={tenantSettings.enableCalendarSync}
                  onCheckedChange={(checked) => handleSwitchChange("enableCalendarSync", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableAutomaticReminders">Automatic Reminders</Label>
                  <p className="text-sm text-muted-foreground">Send automatic reminders for upcoming assessments</p>
                </div>
                <Switch
                  id="enableAutomaticReminders"
                  checked={tenantSettings.enableAutomaticReminders}
                  onCheckedChange={(checked) => handleSwitchChange("enableAutomaticReminders", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Current Plan: Professional</h3>
                    <p className="text-sm text-muted-foreground">$99/month, billed monthly</p>
                  </div>
                  <Button variant="outline">Change Plan</Button>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Payment Method</h3>
                    {tenantSettings.stripeConnected ? (
                      <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No payment method connected</p>
                    )}
                  </div>
                  <Button>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {tenantSettings.stripeConnected ? "Update Payment Method" : "Connect Stripe"}
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Billing History</h3>
                    <p className="text-sm text-muted-foreground">View your past invoices</p>
                  </div>
                  <Button variant="outline">View Invoices</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
