import { query } from "../../_generated/server"
import { v } from "convex/values"

export default query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the token in the database
    const tokenRecord = await ctx.db
      .query("assessmentTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!tokenRecord) {
      return { valid: false, reason: "Token not found" }
    }

    if (tokenRecord.used) {
      return { valid: false, reason: "Token already used" }
    }

    if (tokenRecord.expiresAt < Date.now()) {
      return { valid: false, reason: "Token expired" }
    }

    // Token is valid
    return {
      valid: true,
      tenantId: tokenRecord.tenantId,
      vehicleId: tokenRecord.vehicleId,
      tokenId: tokenRecord._id,
    }
  },
})
