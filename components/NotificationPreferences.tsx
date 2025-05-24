"use client"

import { useState, useEffect } from "react"
import { useNotifications } from "@/hooks/useNotifications"
import { useAuth } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Bell, Mail, BellRing } from "lucide-react"

interface NotificationPreferencesProps {
  tenantId: string
}

export function NotificationPreferences({ tenantId }: NotificationPreferencesProps) {
  const { userId } = useAuth()
  const getPreferences = useMutation(api.notifications.getPreferences)
  const [preferences, setPreferences] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { updatePreferences } = useNotifications({ tenantId })

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!userId) return

      try {
        const prefs = await getPreferences({ userId, tenantId })
        setPreferences(prefs)
      } catch (error) {
        console.error("Failed to fetch notification preferences:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [userId, tenantId, getPreferences])

  const handleChannelToggle = async (channel: string, enabled: boolean) => {
    if (!preferences || !userId) return

    const updatedChannels = {
      ...preferences.channels,
      [channel]: enabled,
    }

    setPreferences({
      ...preferences,
      channels: updatedChannels,
    })

    await updatePreferences({
      channels: updatedChannels,
    })
  }

  const handleCategoryToggle = async (category: string, enabled: boolean) => {
    if (!preferences || !userId) return

    const updatedCategories = {
      ...preferences.categories,
      [category]: {
        ...(preferences.categories[category] || {}),
        enabled,
      },
    }

    setPreferences({
      ...preferences,
      categories: updatedCategories,
    })

    await updatePreferences({
      categories: updatedCategories,
    })
  }

  const handleMuteToggle = async (muted: boolean) => {
    if (!preferences || !userId) return

    // Mute for 24 hours if enabled, otherwise unmute
    const mutedUntil = muted ? Date.now() + 24 * 60 * 60 * 1000 : null

    setPreferences({
      ...preferences,
      mutedUntil,
    })

    await updatePreferences({
      mutedUntil,
    })
  }

  if (loading) {
    return <div>Loading preferences...</div>
  }

  if (!preferences) {
    return <div>Failed to load notification preferences</div>
  }

  const isMuted = preferences.mutedUntil && preferences.mutedUntil > Date.now()

  const categories = [
    { id: "assessments", name: "Assessments", description: "Updates about assessment status and approvals" },
    { id: "bookings", name: "Bookings", description: "Booking confirmations, reminders, and changes" },
    { id: "payments", name: "Payments", description: "Payment confirmations and invoices" },
    { id: "team", name: "Team Activity", description: "Updates about team member actions" },
    { id: "system", name: "System", description: "System maintenance and important announcements" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how and when you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Mute All Notifications</Label>
            <p className="text-sm text-muted-foreground">
              {isMuted ? "Notifications are muted for 24 hours" : "Temporarily disable all notifications"}
            </p>
          </div>
          <Switch checked={isMuted} onCheckedChange={handleMuteToggle} />
        </div>

        <Tabs defaultValue="channels">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="channels">Notification Channels</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BellRing className="h-4 w-4" />
                  <Label htmlFor="in-app">In-App Notifications</Label>
                </div>
                <Switch
                  id="in-app"
                  checked={preferences.channels.inApp}
                  onCheckedChange={(checked) => handleChannelToggle("inApp", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <Label htmlFor="email">Email Notifications</Label>
                </div>
                <Switch
                  id="email"
                  checked={preferences.channels.email}
                  onCheckedChange={(checked) => handleChannelToggle("email", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <Label htmlFor="push">Push Notifications</Label>
                </div>
                <Switch
                  id="push"
                  checked={preferences.channels.push}
                  onCheckedChange={(checked) => handleChannelToggle("push", checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 pt-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <Switch
                  id={`category-${category.id}`}
                  checked={preferences.categories[category.id]?.enabled !== false}
                  onCheckedChange={(checked) => handleCategoryToggle(category.id, checked)}
                />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
