import { query } from "../../_generated/server"
import { v } from "convex/values"
import { createDefaultAssessmentTemplate } from "../../../utils/defaultAssessmentTemplate"

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

    // Get the tenant
    const tenant = await ctx.db
      .query("tenants")
      .filter((q) => q.eq(q.field("_id"), args.tenantId))
      .first()

    if (!tenant) {
      throw new Error("Tenant not found")
    }

    // Return the template or a default if not found
    return tenant.assessmentFormTemplate || createDefaultAssessmentTemplate()
  },
})
