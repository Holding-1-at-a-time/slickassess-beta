import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export default mutation({
  args: {
    storageId: v.string(),
    tenantId: v.string(),
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
      }),
    ),
    isPublic: v.optional(v.boolean()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    // Store file metadata
    const fileId = await ctx.db.insert("files", {
      storageId: args.storageId,
      tenantId: args.tenantId,
      uploadedBy: identity.subject,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      mimeType: args.mimeType,
      category: args.category,
      metadata: args.metadata,
      isPublic: args.isPublic ?? false,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // If it's an assessment image, generate thumbnail
    if (args.category === "assessment_image") {
      await ctx.scheduler.runAfter(0, "files/generateThumbnail", {
        fileId,
        storageId: args.storageId,
      })
    }

    return { fileId, storageId: args.storageId }
  },
})
