import { mutation } from "../_generated/server"
import { v } from "convex/values"

export default mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (session) {
      // Delete the session
      await ctx.db.delete(session._id)
    }

    return { success: true }
  },
})
