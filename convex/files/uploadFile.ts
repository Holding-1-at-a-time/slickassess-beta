import { mutation } from "../_generated/server"
import { v } from "convex/values"

export const generateUploadUrl = mutation({
  args: {
    tenantId: v.string(),
    category: v.union(v.literal("assessment"), v.literal("vehicle"), v.literal("report"), v.literal("profile")),
    metadata: v.optional(
      v.object({
        assessmentId: v.optional(v.id("assessments")),
        vehicleId: v.optional(v.id("vehicles")),
        fileName: v.optional(v.string()),
        contentType: v.optional(v.string()),
        size: v.optional(v.number()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Verify user has access to the tenant
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    // Generate a storage ID for the file
    const storageId = await ctx.storage.generateUploadUrl()

    // Store metadata for the file
    const fileId = await ctx.db.insert("files", {
      tenantId: args.tenantId,
      storageId: storageId,
      category: args.category,
      uploadedBy: identity.subject,
      uploadedAt: Date.now(),
      status: "pending",
      metadata: args.metadata || {},
    })

    return {
      uploadUrl: storageId,
      fileId,
    }
  },
})

export const confirmUpload = mutation({
  args: {
    fileId: v.id("files"),
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    // Update the file record to confirm upload
    await ctx.db.patch(args.fileId, {
      storageId: args.storageId,
      status: "uploaded",
    })

    // Get the file URL
    const url = await ctx.storage.getUrl(args.storageId)

    return { url }
  },
})
