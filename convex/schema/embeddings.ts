import { defineTable } from "convex/server"
import { v } from "convex/values"

export const embeddings = defineTable({
  tenantId: v.string(),
  entityType: v.union(v.literal("assessment"), v.literal("vehicle"), v.literal("analysis"), v.literal("description")),
  entityId: v.string(),
  embedding: v.array(v.float64()),
  text: v.string(),
  metadata: v.object({
    title: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
  }),
})
  .vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536, // OpenAI embedding dimensions
    filterFields: ["tenantId", "entityType"],
  })
  .index("by_tenant", ["tenantId"])
  .index("by_entity", ["entityType", "entityId"])
