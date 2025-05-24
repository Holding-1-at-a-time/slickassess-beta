import { defineTable } from "convex/server"
import { v } from "convex/values"

export const textStreams = defineTable({
  sessionId: v.string(),
  tenantId: v.string(),
  userId: v.optional(v.string()),
  type: v.union(
    v.literal("assessment_analysis"),
    v.literal("chat_response"),
    v.literal("report_generation"),
    v.literal("system_notification"),
    v.literal("assessment_update"),
    v.literal("booking_update"),
    v.literal("payment_notification"),
    v.literal("team_activity"),
  ),
  status: v.union(v.literal("pending"), v.literal("streaming"), v.literal("completed"), v.literal("failed")),
  content: v.string(),
  metadata: v.optional(v.any()),
  error: v.optional(v.string()),
  priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
  category: v.optional(v.string()),
  expiresAt: v.optional(v.number()),
  readAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
})
  .index("by_session", ["sessionId"])
  .index("by_tenant_and_type", ["tenantId", "type"])
  .index("by_status", ["status"])
  .index("by_created", ["createdAt"])
  .index("by_user_and_read", ["userId", "readAt"])
  .index("by_expiry", ["expiresAt"])
  .index("by_priority", ["priority"])
