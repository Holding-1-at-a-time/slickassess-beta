import { mutation } from "../../_generated/server"
import { v } from "convex/values"
import { internal } from "../../_generated/api"

export default mutation({
  args: {
    tokenId: v.id("assessmentTokens"),
    tenantId: v.string(),
    vehicleId: v.optional(v.id("vehicles")),
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
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Create the assessment
    const assessmentId = await ctx.db.insert("assessments", {
      tenantId: args.tenantId,
      vehicleId: args.vehicleId,
      status: "pending",
      formData: args.formData,
      images: args.images,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // If there are images, trigger AI analysis
    if (args.images.length > 0) {
      // Schedule AI analysis as a background task
      await ctx.scheduler.runAfter(0, internal.assessments.analyzeImages, {
        assessmentId,
        tenantId: args.tenantId,
      })
    }

    return { success: true, assessmentId }
  },
})
