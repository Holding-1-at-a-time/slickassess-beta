import { defineTable } from "convex/server"
import { v } from "convex/values"

export const notificationPreferences = defineTable({
  userId: v.string(),
  tenantId: v.string(),
  channels: v.object({
    inApp: v.boolean(),
    email: v.boolean(),
    push: v.boolean(),
  }),
  categories: v.map(
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
  mutedUntil: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_tenant_and_user", ["tenantId", "userId"])
