import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export default mutation({
  args: {
    tokenId: v.id("assessmentTokens"),
    tenantId: v.string(),
    vehicleId: v.optional(v.string()),
    formData: v.object({
      sections: v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          items: v.array(
            v.object({
              id: v.string(),
              type: v.union(v.literal("checkbox"), v.literal("text"), v.literal("select"), v.literal("photo")),
              label: v.string(),
              value: v.optional(v.any()),
              options: v.optional(v.array(v.string())),
            }),
          ),
        }),
      ),
    }),
    images: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Validate the token
    const token = await ctx.db.get(args.tokenId)

    if (!token) {
      throw new Error("Invalid token")
    }

    if (token.used) {
      throw new Error("Token already used")
    }

    if (token.expiresAt < Date.now()) {
      throw new Error("Token expired")
    }

    if (token.tenantId !== args.tenantId) {
      throw new Error("Token does not match tenant")
    }

    // Create the assessment
    const assessmentId = await ctx.db.insert("assessments", {
      tenantId: args.tenantId,
      vehicleId: args.vehicleId || token.vehicleId,
      status: "pending",
      formData: args.formData,
      images: args.images || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Mark the token as used
    await ctx.db.patch(args.tokenId, {
      used: true,
    })

    // Schedule AI analysis if images are provided
    if (args.images && args.images.length > 0) {
      await ctx.scheduler.runAfter(0, "assessments/analyzeImages", {
        assessmentId,
        tenantId: args.tenantId,
      })
    }

    return { assessmentId }
  },
})
