import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export default mutation({
  args: {
    tenantId: v.string(),
    category: v.union(
      v.literal("assessment_image"),
      v.literal("vehicle_document"),
      v.literal("report"),
      v.literal("avatar"),
      v.literal("logo"),
    ),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    // Verify user has access to this tenant
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    // Check file size limits based on category
    const sizeLimits = {
      assessment_image: 10 * 1024 * 1024, // 10MB
      vehicle_document: 5 * 1024 * 1024, // 5MB
      report: 20 * 1024 * 1024, // 20MB
      avatar: 2 * 1024 * 1024, // 2MB
      logo: 2 * 1024 * 1024, // 2MB
    }

    if (args.fileSize > sizeLimits[args.category]) {
      throw new Error(`File size exceeds limit for ${args.category}`)
    }

    // Generate upload URL
    const uploadUrl = await ctx.storage.generateUploadUrl()

    return uploadUrl
  },
})
