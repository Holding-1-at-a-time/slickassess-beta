import { mutation } from "../../_generated/server"
import { v } from "convex/values"

/**
 * Generates a URL for uploading a file to Convex Storage.
 *
 * @param contentType - The MIME type of the file being uploaded (optional)
 * @returns An object containing the upload URL and storage ID
 */
export default mutation({
  args: {
    contentType: v.optional(v.string()),
    fileName: v.optional(v.string()),
    maxSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Set default max size to 10MB if not specified
    const maxSize = args.maxSize || 10 * 1024 * 1024

    // Generate a storage ID for the file
    const storageId = await ctx.storage.generateUploadUrl({
      contentType: args.contentType,
      maxSize,
    })

    // Store metadata about the file if fileName is provided
    if (args.fileName) {
      await ctx.db.insert("fileMetadata", {
        storageId: storageId.storageId,
        fileName: args.fileName,
        contentType: args.contentType || "application/octet-stream",
        uploadedBy: (await ctx.auth.getUserIdentity())?.tokenIdentifier || "anonymous",
        status: "pending",
        uploadedAt: Date.now(),
      })
    }

    return {
      uploadUrl: storageId.uploadUrl,
      storageId: storageId.storageId,
    }
  },
})
