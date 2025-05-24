import { query } from "../../_generated/server"
import { v } from "convex/values"

export default query({
  args: {
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify the user has access to this tenant
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    // Check if the user has access to this tenant
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", identity.subject))
      .first()

    if (!user || user.tenantId !== args.tenantId) {
      throw new Error("Unauthorized: User does not have access to this tenant")
    }

    // Get all assessments for this tenant
    return await ctx.db
      .query("assessments")
      .filter((q) => q.eq(q.field("tenantId"), args.tenantId))
      .collect()
  },
})
