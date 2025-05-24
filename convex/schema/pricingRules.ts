import { defineTable } from "convex/server"
import { v } from "convex/values"

export default defineTable({
  tenantId: v.string(),
  serviceName: v.string(),
  basePrice: v.number(),
  duration: v.number(), // in minutes
  multipliers: v.optional(
    v.object({
      seasonal: v.optional(v.number()),
      weekend: v.optional(v.number()),
      holiday: v.optional(v.number()),
      loyalty: v.optional(v.number()),
      volume: v.optional(v.number()),
    }),
  ),
  active: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_tenant_and_service", ["tenantId", "serviceName"])
