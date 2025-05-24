import { defineTable } from "convex/server"
import { v } from "convex/values"

export const files = defineTable({
  tenantId: v.string(),
  storageId: v.optional(v.string()),
  category: v.union(v.literal("assessment"), v.literal("vehicle"), v.literal("report"), v.literal("profile")),
  uploadedBy: v.string(),
  uploadedAt: v.number(),
  status: v.union(v.literal("pending"), v.literal("uploaded"), v.literal("failed")),
  metadata: v.object({
    assessmentId: v.optional(v.id("assessments")),
    vehicleId: v.optional(v.id("vehicles")),
    fileName: v.optional(v.string()),
    contentType: v.optional(v.string()),
    size: v.optional(v.number()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  }),
})
  .index("by_tenant", ["tenantId"])
  .index("by_category", ["tenantId", "category"])
  .index("by_assessment", ["metadata.assessmentId"])
  .index("by_status", ["status"])
