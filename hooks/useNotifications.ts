"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useCallback, useMemo } from "react"
import { useAuth } from "@clerk/nextjs"

interface UseNotificationsOptions {
  tenantId: string
  includeRead?: boolean
  types?: string[]
  category?: string
  limit?: number
}

export function useNotifications({
  tenantId,
  includeRead = false,
  types,
  category,
  limit = 20,
}: UseNotificationsOptions) {
  const { userId } = useAuth()

  const paginationOpts = useMemo(() => ({ limit }), [limit])

  const notificationsResult = useQuery(
    api.notifications.getUserNotifications,
    userId
      ? {
          userId,
          tenantId,
          includeRead,
          types,
          category,
          paginationOpts,
        }
      : "skip",
  )

  const unreadCount = useQuery(api.notifications.getUnreadCount, userId ? { userId, tenantId } : "skip")

  const markAsRead = useMutation(api.notifications.markAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllAsRead)
  const updatePreferences = useMutation(api.notifications.updatePreferences)

  const handleMarkAsRead = useCallback(
    async (notificationId) => {
      await markAsRead({ notificationId })
    },
    [markAsRead],
  )

  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId) return
    await markAllAsRead({ userId, tenantId })
  }, [markAllAsRead, userId, tenantId])

  const handleUpdatePreferences = useCallback(
    async (preferences) => {
      if (!userId) return
      await updatePreferences({
        userId,
        tenantId,
        ...preferences,
      })
    },
    [updatePreferences, userId, tenantId],
  )

  return {
    notifications: notificationsResult?.notifications || [],
    isLoading: notificationsResult === undefined,
    continueCursor: notificationsResult?.continueCursor,
    unreadCount: unreadCount?.count || 0,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    updatePreferences: handleUpdatePreferences,
  }
}
