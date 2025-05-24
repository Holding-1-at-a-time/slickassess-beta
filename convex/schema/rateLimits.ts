import { defineTable } from "convex/server"
import { v } from "convex/values"

export const rateLimits = defineTable({
  key: v.string(),
  identifier: v.string(),
  action: v.string(),
  timestamp: v.number(),
})
  .index("by_key_and_timestamp", ["key", "timestamp"])
  .index("by_timestamp", ["timestamp"])
  .index("by_identifier", ["identifier"])
