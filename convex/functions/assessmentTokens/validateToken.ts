import { query } from "../../_generated/server"
import { v } from "convex/values"

export default query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the token in the database
    const tokenDoc = await ctx.db
      .query("assessmentTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first()

    if (!tokenDoc) {
      return {
        valid: false,
        reason: "Token not found",
      }
    }

    // Check if token is expired
    if (tokenDoc.expiresAt < Date.now()) {
      return {
        valid: false,
        reason: "Token has expired",
        tokenId: tokenDoc._id,
      }
    }

    // Check if token has been used
    if (tokenDoc.used) {
      return {
        valid: false,
        reason: "Token has already been used",
        tokenId: tokenDoc._id,
      }
    }

    // Get the tenant
    const tenant = await ctx.db.get(tokenDoc.tenantId)
    if (!tenant) {
      return {
        valid: false,
        reason: "Invalid tenant",
        tokenId: tokenDoc._id,
      }
    }

    // Get the vehicle if specified
    let vehicle = null
    if (tokenDoc.vehicleId) {
      vehicle = await ctx.db.get(tokenDoc.vehicleId)
      if (!vehicle) {
        return {
          valid: false,
          reason: "Vehicle not found",
          tokenId: tokenDoc._id,
          tenantId: tokenDoc.tenantId,
        }
      }
    }

    // Get the form template
    const formTemplate =
      tenant.assessmentFormTemplate ||
      (await ctx.db
        .query("assessmentTemplates")
        .withIndex("by_tenant", (q) => q.eq("tenantId", tokenDoc.tenantId))
        .first()
        .then((template) => template?.template || null))

    if (!formTemplate) {
      return {
        valid: false,
        reason: "Assessment form template not found",
        tokenId: tokenDoc._id,
        tenantId: tokenDoc.tenantId,
      }
    }

    // Token is valid
    return {
      valid: true,
      tokenId: tokenDoc._id,
      tenantId: tokenDoc.tenantId,
      vehicleId: tokenDoc.vehicleId,
      formTemplate,
    }
  },
})
