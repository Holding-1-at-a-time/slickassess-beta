import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export default mutation({
  args: {
    contentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate a storage ID for the file
    const storageId = await ctx.storage.generateUploadUrl(args.contentType || "image/jpeg")

    return {
      uploadUrl: storageId.uploadUrl,
      storageId: storageId.storageId,
    }
  },
})
