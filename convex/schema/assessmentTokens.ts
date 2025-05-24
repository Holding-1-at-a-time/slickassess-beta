import { defineTable } from "convex/server"
import { v } from "convex/values"

export default defineTable({
  token: v.string(),
  tenantId: v.string(),
  vehicleId: v.optional(v.string()),
  expiresAt: v.number(),
  used: v.boolean(),
  createdAt: v.number(),
})
  .index("by_token", ["token"])
  .index("by_tenant", ["tenantId"])
