import { defineTable } from "convex/server"
import { v } from "convex/values"

export const migrations = defineTable({
  name: v.string(),
  version: v.number(),
  description: v.optional(v.string()),
  status: v.union(
    v.literal("pending"),
    v.literal("running"),
    v.literal("completed"),
    v.literal("failed"),
    v.literal("rolled_back"),
  ),
  startedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  error: v.optional(v.string()),
  affectedRecords: v.optional(v.number()),
  rollbackData: v.optional(v.any()),
})
  .index("by_name", ["name"])
  .index("by_version", ["version"])
  .index("by_status", ["status"])
