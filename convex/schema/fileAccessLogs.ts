import { defineTable } from "convex/server"
import { v } from "convex/values"

export const fileAccessLogs = defineTable({
  fileId: v.id("files"),
  userId: v.id("users"),
  tenantId: v.id("tenants"),
  accessedAt: v.number(),
  ipAddress: v.string(),
})
  .index("by_file", ["fileId"])
  .index("by_user", ["userId"])
  .index("by_tenant", ["tenantId"])
  .index("by_date", ["accessedAt"])
