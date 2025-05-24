import { defineTable } from "convex/server"
import { v } from "convex/values"

export const textStreams = defineTable({
  sessionId: v.string(),
  tenantId: v.string(),
  userId: v.optional(v.string()),
  type: v.union(v.literal("assessment_analysis"), v.literal("chat_response"), v.literal("report_generation")),
  status: v.union(v.literal("pending"), v.literal("streaming"), v.literal("completed"), v.literal("failed")),
  content: v.string(),
  metadata: v.optional(v.any()),
  error: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  completedAt: v.optional(v.number()),
})
  .index("by_session", ["sessionId"])
  .index("by_tenant_and_type", ["tenantId", "type"])
  .index("by_status", ["status"])
  .index("by_created", ["createdAt"])
