import { mutation } from "../../_generated/server"
import { v } from "convex/values"
import { withRateLimit } from "../../lib/rateLimiter"
import { ConvexError } from "convex/values"

export const createSelfAssessmentWithRateLimit = mutation({
  args: {
    token: v.string(),
    vehicleInfo: v.object({
      make: v.string(),
      model: v.string(),
      year: v.number(),
      mileage: v.number(),
      vin: v.optional(v.string()),
    }),
    customerInfo: v.object({
      name: v.string(),
      email: v.string(),
      phone: v.string(),
    }),
    images: v.array(v.string()),
    formData: v.any(),
  },
  handler: withRateLimit(
    "createAssessment",
    (args) => args.customerInfo.email, // Use email as identifier
    async (ctx, args) => {
      // Validate token
      const tokenRecord = await ctx.db
        .query("assessmentTokens")
        .withIndex("by_token", (q) => q.eq("token", args.token))
        .first()

      if (!tokenRecord || tokenRecord.used || tokenRecord.expiresAt < Date.now()) {
        throw new ConvexError("Invalid or expired token")
      }

      // Create assessment with rate limiting protection
      const assessmentId = await ctx.db.insert("assessments", {
        tenantId: tokenRecord.tenantId,
        vehicleId: tokenRecord.vehicleId || "new",
        type: "self-assessment",
        scheduledDate: new Date().toISOString(),
        status: "in_progress",
        customerInfo: args.customerInfo,
        vehicleInfo: args.vehicleInfo,
        images: args.images,
        formData: args.formData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })

      // Mark token as used
      await ctx.db.patch(tokenRecord._id, { used: true })

      return { assessmentId }
    },
  ),
})
