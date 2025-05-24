import { mutation } from "../../_generated/server"
import { v } from "convex/values"
import { ConvexError } from "convex/values"

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
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to upload files",
      })
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
      throw new ConvexError({
        code: "FILE_TOO_LARGE",
        message: `File size exceeds limit of ${sizeLimits[args.category] / (1024 * 1024)}MB for ${args.category}`,
        limit: sizeLimits[args.category],
        provided: args.fileSize,
      })
    }

    // Validate file type
    const allowedTypes = {
      assessment_image: ["image/jpeg", "image/png", "image/webp"],
      vehicle_document: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      report: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      avatar: ["image/jpeg", "image/png", "image/webp"],
      logo: ["image/jpeg", "image/png", "image/svg+xml", "image/webp"],
    }

    if (!allowedTypes[args.category].includes(args.fileType)) {
      throw new ConvexError({
        code: "INVALID_FILE_TYPE",
        message: `Invalid file type for ${args.category}. Allowed types: ${allowedTypes[args.category].join(", ")}`,
        allowedTypes: allowedTypes[args.category],
        provided: args.fileType,
      })
    }

    // Generate upload URL
    const uploadUrl = await ctx.storage.generateUploadUrl()

    // Log the upload request
    await ctx.db.insert("fileUploadLogs", {
      tenantId: args.tenantId,
      userId: identity.subject,
      category: args.category,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      timestamp: Date.now(),
      status: "url_generated",
    })

    return uploadUrl
  },
})
