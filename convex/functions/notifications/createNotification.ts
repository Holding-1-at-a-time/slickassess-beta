import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export const createNotification = mutation({
  args: {
    userId: v.string(),
    tenantId: v.string(),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("system_notification"),
      v.literal("assessment_update"),
      v.literal("booking_update"),
      v.literal("payment_notification"),
      v.literal("team_activity"),
    ),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
    category: v.optional(v.string()),
    metadata: v.optional(v.any()),
    expiresIn: v.optional(v.number()), // Expiry in milliseconds
    relatedId: v.optional(v.union(v.id("assessments"), v.id("bookings"), v.id("payments"))),
    actionUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check user notification preferences
    const userPrefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_tenant_and_user", (q) => q.eq("tenantId", args.tenantId).eq("userId", args.userId))
      .first()

    // If user has muted notifications, don't create one
    if (userPrefs?.mutedUntil && userPrefs.mutedUntil > Date.now()) {
      return null
    }

    // Check category preferences
    if (args.category && userPrefs?.categories?.[args.category]) {
      const categoryPref = userPrefs.categories[args.category]
      if (!categoryPref.enabled) {
        return null
      }
    }

    const now = Date.now()
    const sessionId = `notification-${args.userId}-${now}`

    // Format notification content as JSON
    const notificationContent = JSON.stringify({
      title: args.title,
      message: args.message,
      timestamp: now,
      actionUrl: args.actionUrl,
      metadata: args.metadata,
    })

    // Calculate expiry time if provided
    const expiresAt = args.expiresIn ? now + args.expiresIn : undefined

    // Create the notification stream
    const streamId = await ctx.db.insert("textStreams", {
      sessionId,
      tenantId: args.tenantId,
      userId: args.userId,
      type: args.type,
      status: "completed", // Notifications are completed immediately
      content: notificationContent,
      metadata: {
        ...args.metadata,
        relatedId: args.relatedId,
        actionUrl: args.actionUrl,
      },
      priority: args.priority || "medium",
      category: args.category,
      expiresAt,
      createdAt: now,
      updatedAt: now,
      completedAt: now,
    })

    // Trigger any additional notification channels (email, push) here
    // This would typically call other functions or services

    return streamId
  },
})
