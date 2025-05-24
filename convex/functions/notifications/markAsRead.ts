import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export const markAsRead = mutation({
  args: {
    notificationId: v.id("textStreams"),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId)

    if (!notification) {
      throw new Error("Notification not found")
    }

    // Only allow marking as read if the notification is a notification type
    const notificationTypes = [
      "system_notification",
      "assessment_update",
      "booking_update",
      "payment_notification",
      "team_activity",
    ]

    if (!notificationTypes.includes(notification.type)) {
      throw new Error("Invalid notification type")
    }

    await ctx.db.patch(args.notificationId, {
      readAt: Date.now(),
    })

    return { success: true }
  },
})

export const markAllAsRead = mutation({
  args: {
    userId: v.string(),
    tenantId: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Build the query
    let query = ctx.db
      .query("textStreams")
      .withIndex("by_user_and_read", (q) => q.eq("userId", args.userId).eq("readAt", undefined))
      .filter((q) => q.eq(q.field("tenantId"), args.tenantId))

    // Add type filter if specified
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type))
    }

    // Get all unread notifications
    const notifications = await query.collect()

    // Mark all as read
    for (const notification of notifications) {
      await ctx.db.patch(notification._id, {
        readAt: now,
      })
    }

    return {
      success: true,
      count: notifications.length,
    }
  },
})
