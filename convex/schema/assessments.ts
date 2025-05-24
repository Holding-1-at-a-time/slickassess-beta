import { defineTable } from "convex/server"
import { v } from "convex/values"

export default defineTable({
  tenantId: v.string(),
  vehicleId: v.string(),
  status: v.optional(
    v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  ),
  formData: v.object({
    sections: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        items: v.array(
          v.object({
            id: v.string(),
            type: v.union(v.literal("checkbox"), v.literal("text"), v.literal("select"), v.literal("photo")),
            label: v.string(),
            value: v.optional(v.any()),
            options: v.optional(v.array(v.string())),
          }),
        ),
      }),
    ),
  }),
  images: v.optional(v.array(v.string())),
  aiAnalysis: v.optional(
    v.object({
      detectedIssues: v.array(
        v.object({
          type: v.string(),
          location: v.string(),
          severity: v.number(),
          confidence: v.number(),
        }),
      ),
      summary: v.string(),
    }),
  ),
  estimatedPrice: v.optional(v.number()),
  estimatedDuration: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
