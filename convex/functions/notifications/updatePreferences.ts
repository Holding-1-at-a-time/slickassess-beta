import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export const updatePreferences = mutation({
  args: {
    userId: v.string(),
    tenantId: v.string(),
    channels: v.optional(
      v.object({
        inApp: v.boolean(),
        email: v.boolean(),
        push: v.boolean(),
      }),
    ),
    categories: v.optional(
      v.map(
        v.string(),
        v.object({
          enabled: v.boolean(),
          channels: v.optional(
            v.object({
              inApp: v.boolean(),
              email: v.boolean(),
              push: v.boolean(),
            }),
          ),
        }),
      ),
    ),
    mutedUntil: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    // Check if preferences already exist
    const existingPrefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_tenant_and_user", (q) => q.eq("tenantId", args.tenantId).eq("userId", args.userId))
      .first()

    if (existingPrefs) {
      // Update existing preferences
      const updates: any = { updatedAt: now }

      if (args.channels) {
        updates.channels = args.channels
      }

      if (args.categories) {
        // Merge with existing categories
        updates.categories = {
          ...existingPrefs.categories,
          ...args.categories,
        }
      }

      if (args.mutedUntil !== undefined) {
        updates.mutedUntil = args.mutedUntil
      }

      await ctx.db.patch(existingPrefs._id, updates)
      return existingPrefs._id
    } else {
      // Create new preferences
      const defaultChannels = {
        inApp: true,
        email: true,
        push: false,
      }

      const prefsId = await ctx.db.insert("notificationPreferences", {
        userId: args.userId,
        tenantId: args.tenantId,
        channels: args.channels || defaultChannels,
        categories: args.categories || {},
        mutedUntil: args.mutedUntil,
        createdAt: now,
        updatedAt: now,
      })

      return prefsId
    }
  },
})

export const getPreferences = mutation({
  args: {
    userId: v.string(),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_tenant_and_user", (q) => q.eq("tenantId", args.tenantId).eq("userId", args.userId))
      .first()

    if (!prefs) {
      // Return default preferences
      return {
        userId: args.userId,
        tenantId: args.tenantId,
        channels: {
          inApp: true,
          email: true,
          push: false,
        },
        categories: {},
        mutedUntil: null,
      }
    }

    return prefs
  },
})
