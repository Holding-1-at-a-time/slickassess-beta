import { defineTable } from "convex/server"
import { v } from "convex/values"

export const embeddings = defineTable({
  tenantId: v.string(),
  contentId: v.string(),
  contentType: v.union(
    v.literal("assessment"),
    v.literal("vehicle"),
    v.literal("damage_description"),
    v.literal("service_description"),
    v.literal("customer_note"),
  ),
  text: v.string(),
  embedding: v.array(v.float64()),
  metadata: v.optional(
    v.object({
      assessmentId: v.optional(v.id("selfAssessments")),
      vehicleId: v.optional(v.id("vehicles")),
      severity: v.optional(v.string()),
      category: v.optional(v.string()),
    }),
  ),
  createdAt: v.number(),
})
  .index("by_tenant", ["tenantId"])
  .index("by_content", ["tenantId", "contentId"])
  .index("by_type", ["tenantId", "contentType"])
  .vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 1536, // OpenAI text-embedding-3-small dimensions
    filterFields: ["tenantId", "contentType"],
  })
