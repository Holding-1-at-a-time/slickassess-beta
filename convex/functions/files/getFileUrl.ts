import { query } from "../../_generated/server"
import { v } from "convex/values"

export default query({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId)
    if (!file) {
      throw new Error("File not found")
    }

    // Check if file is public or user has access
    const identity = await ctx.auth.getUserIdentity()
    if (!file.isPublic && !identity) {
      throw new Error("Unauthorized")
    }

    // Get the file URL
    const url = await ctx.storage.getUrl(file.storageId)
    if (!url) {
      throw new Error("File not found in storage")
    }

    return {
      url,
      fileName: file.fileName,
      mimeType: file.mimeType,
      fileSize: file.fileSize,
      metadata: file.metadata,
    }
  },
})
