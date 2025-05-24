import { query } from "../../_generated/server"
import { v } from "convex/values"
import { paginationOptsValidator } from "../../lib/paginationValidator"

export const getUserNotifications = query({
  args: {
    userId: v.string(),
    tenantId: v.string(),
    includeRead: v.optional(v.boolean()),
    types: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
    paginationOpts: v.optional(paginationOptsValidator),
  },
  handler: async (ctx, args) => {
    const { paginationOpts } = args
    const limit = paginationOpts?.limit ?? 20
    const cursor = paginationOpts?.cursor

    // Start with base query for user's notifications
    let query = ctx.db
      .query("textStreams")
      .withIndex("by_user_and_read", (q) => {
        // If includeRead is false, only get unread notifications
        if (args.includeRead === false) {
          return q.eq("userId", args.userId).eq("readAt", undefined)
        }
        return q.eq("userId", args.userId)
      })
      .filter((q) => q.eq(q.field("tenantId"), args.tenantId))

    // Filter by notification types
    const notificationTypes = [
      "system_notification",
      "assessment_update",
      "booking_update",
      "payment_notification",
      "team_activity",
    ]

    query = query.filter((q) => q.or(...notificationTypes.map((type) => q.eq(q.field("type"), type))))

    // Apply additional filters
    if (args.types && args.types.length > 0) {
      query = query.filter((q) => q.or(...args.types!.map((type) => q.eq(q.field("type"), type))))
    }

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category))
    }

    if (args.priority) {
      query = query.filter((q) => q.eq(q.field("priority"), args.priority))
    }

    // Don't show expired notifications
    query = query.filter((q) => q.or(q.eq(q.field("expiresAt"), undefined), q.gt(q.field("expiresAt"), Date.now())))

    // Order by creation time, newest first
    query = query.order("desc")

    // Apply pagination
    const notifications = await query.paginate(cursor, limit)

    // Parse the content for each notification
    const parsedNotifications = notifications.page.map((notification) => {
      try {
        const content = JSON.parse(notification.content)
        return {
          ...notification,
          parsedContent: content,
        }
      } catch (e) {
        return {
          ...notification,
          parsedContent: { error: "Failed to parse notification content" },
        }
      }
    })

    return {
      notifications: parsedNotifications,
      continueCursor: notifications.continueCursor,
    }
  },
})

export const getUnreadCount = query({
  args: {
    userId: v.string(),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const notificationTypes = [
      "system_notification",
      "assessment_update",
      "booking_update",
      "payment_notification",
      "team_activity",
    ]

    const count = await ctx.db
      .query("textStreams")
      .withIndex("by_user_and_read", (q) => q.eq("userId", args.userId).eq("readAt", undefined))
      .filter((q) =>
        q.and(
          q.eq(q.field("tenantId"), args.tenantId),
          q.or(...notificationTypes.map((type) => q.eq(q.field("type"), type))),
          q.or(q.eq(q.field("expiresAt"), undefined), q.gt(q.field("expiresAt"), Date.now())),
        ),
      )
      .count()

    return { count }
  },
})
