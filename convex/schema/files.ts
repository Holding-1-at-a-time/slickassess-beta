import { defineTable } from "convex/server"
import { v } from "convex/values"

export const files = defineTable({
  storageId: v.string(),
  tenantId: v.string(),
  uploadedBy: v.string(),
  fileName: v.string(),
  fileType: v.string(),
  fileSize: v.number(),
  mimeType: v.string(),
  category: v.union(
    v.literal("assessment_image"),
    v.literal("vehicle_document"),
    v.literal("report"),
    v.literal("avatar"),
    v.literal("logo"),
  ),
  metadata: v.optional(
    v.object({
      assessmentId: v.optional(v.id("selfAssessments")),
      vehicleId: v.optional(v.id("vehicles")),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      thumbnailStorageId: v.optional(v.string()),
    }),
  ),
  isPublic: v.boolean(),
  expiresAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_tenant", ["tenantId"])
  .index("by_category", ["tenantId", "category"])
  .index("by_assessment", ["metadata.assessmentId"])
  .index("by_expiry", ["expiresAt"])
