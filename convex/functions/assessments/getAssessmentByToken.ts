import { query } from "../../_generated/server"
import { v } from "convex/values"

export default query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the token
    const tokenRecord = await ctx.db
      .query("assessmentTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!tokenRecord) {
      return null
    }

    // Get the tenant's form template
    const tenant = await ctx.db
      .query("tenants")
      .filter((q) => q.eq(q.field("_id"), tokenRecord.tenantId))
      .first()

    if (!tenant) {
      return null
    }

    // Get vehicle info if vehicleId is provided
    let vehicle = null
    if (tokenRecord.vehicleId) {
      vehicle = await ctx.db.get(tokenRecord.vehicleId)
    }

    return {
      token: tokenRecord,
      tenant,
      vehicle,
      formTemplate: tenant.assessmentFormTemplate,
    }
  },
})
