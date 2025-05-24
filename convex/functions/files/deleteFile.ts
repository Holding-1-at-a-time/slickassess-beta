import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export default mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    const file = await ctx.db.get(args.fileId)
    if (!file) {
      throw new Error("File not found")
    }

    // Delete from storage
    await ctx.storage.delete(file.storageId)

    // Delete thumbnail if exists
    if (file.metadata?.thumbnailStorageId) {
      await ctx.storage.delete(file.metadata.thumbnailStorageId)
    }

    // Delete metadata
    await ctx.db.delete(args.fileId)

    return { success: true }
  },
})
