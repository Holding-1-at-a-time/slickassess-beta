"use client"

import { useState } from "react"
import { useNotifications } from "@/hooks/useNotifications"
import { Bell, BellOff, Check, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface NotificationCenterProps {
  tenantId: string
}

export function NotificationCenter({ tenantId }: NotificationCenterProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications({
    tenantId,
    includeRead: activeTab === "all",
  })

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    setOpen(false)
  }

  const getRelativeTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) return "just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assessment_update":
        return "📋"
      case "booking_update":
        return "📅"
      case "payment_notification":
        return "💰"
      case "team_activity":
        return "👥"
      default:
        return "🔔"
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1 min-w-[18px] h-[18px] flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="icon" onClick={handleMarkAllAsRead} title="Mark all as read">
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" title="Notification settings">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread" disabled={unreadCount === 0}>
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="m-0">
            <NotificationList
              notifications={notifications}
              markAsRead={markAsRead}
              getRelativeTime={getRelativeTime}
              getNotificationIcon={getNotificationIcon}
            />
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <NotificationList
              notifications={notifications}
              markAsRead={markAsRead}
              getRelativeTime={getRelativeTime}
              getNotificationIcon={getNotificationIcon}
            />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}

function NotificationList({ notifications, markAsRead, getRelativeTime, getNotificationIcon }) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
        <BellOff className="h-8 w-8 mb-2 opacity-50" />
        <p>No notifications</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="divide-y">
        {notifications.map((notification) => {
          const content = notification.parsedContent
          const isUnread = !notification.readAt

          return (
            <div
              key={notification._id}
              className={cn("p-4 relative hover:bg-muted/50 transition-colors", isUnread && "bg-muted/30")}
            >
              <div className="flex gap-3">
                <div className="text-xl flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-medium text-sm">{content.title}</h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {getRelativeTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{content.message}</p>

                  {content.actionUrl && (
                    <a href={content.actionUrl} className="text-xs text-primary hover:underline mt-2 inline-block">
                      View details
                    </a>
                  )}
                </div>
              </div>

              {isUnread && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => markAsRead(notification._id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
