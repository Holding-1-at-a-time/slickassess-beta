import { query } from "../_generated/server"
import { v } from "convex/values"

export default query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!session || session.expiresAt < Date.now()) {
      return null
    }

    // Get the user
    const user = await ctx.db.get(session.userId)
    if (!user) {
      return null
    }

    // Return user data without sensitive information
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
    }
  },
})
