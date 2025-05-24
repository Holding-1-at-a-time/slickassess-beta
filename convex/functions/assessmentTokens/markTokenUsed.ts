import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export default mutation({
  args: {
    tokenId: v.id("assessmentTokens"),
  },
  handler: async (ctx, args) => {
    // Mark the token as used
    await ctx.db.patch(args.tokenId, {
      used: true,
    })

    return { success: true }
  },
})
