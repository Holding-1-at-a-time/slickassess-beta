import { mutation } from "../../_generated/server"
import { v } from "convex/values"
import { nanoid } from "nanoid"

export default mutation({
  args: {
    tenantId: v.string(),
    vehicleId: v.optional(v.string()),
    expiryMinutes: v.optional(v.number()),
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

    // Generate a unique token
    const token = nanoid(12)

    // Set expiry time (default to 24 hours if not specified)
    const expiryMinutes = args.expiryMinutes || 24 * 60
    const expiresAt = Date.now() + expiryMinutes * 60 * 1000

    // Store the token in the database
    const tokenId = await ctx.db.insert("assessmentTokens", {
      token,
      tenantId: args.tenantId,
      vehicleId: args.vehicleId,
      expiresAt,
      used: false,
      createdAt: Date.now(),
    })

    return { token, expiresAt, tokenId }
  },
})
