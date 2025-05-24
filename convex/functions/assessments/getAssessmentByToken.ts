import { query } from "../../_generated/server"
import { v } from "convex/values"

export default query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate the token
    const tokenRecord = await ctx.db
      .query("assessmentTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!tokenRecord) {
      return null
    }

    // Get the tenant
    const tenant = await ctx.db.get(tokenRecord.tenantId)

    // Get the vehicle if available
    const vehicle = tokenRecord.vehicleId ? await ctx.db.get(tokenRecord.vehicleId) : null

    // Get the form template from the tenant
    const formTemplate = tenant?.assessmentFormTemplate || {
      sections: [],
    }

    return {
      tenant: tenant ? { name: tenant.name, _id: tenant._id } : null,
      vehicle,
      formTemplate,
    }
  },
})
