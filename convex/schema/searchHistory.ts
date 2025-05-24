import { defineTable } from "convex/server"
import { v } from "convex/values"

export const searchHistory = defineTable({
  tenantId: v.string(),
  userId: v.string(),
  query: v.string(),
  searchType: v.union(v.literal("text"), v.literal("vector"), v.literal("hybrid")),
  resultsCount: v.number(),
  clickedResults: v.optional(v.array(v.string())),
  createdAt: v.number(),
})
  .index("by_tenant", ["tenantId"])
  .index("by_user", ["tenantId", "userId"])
  .index("by_query", ["tenantId", "query"])
