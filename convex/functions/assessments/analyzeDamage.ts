import { mutation } from "../../_generated/server"
import { v } from "convex/values"
import { internal } from "../../_generated/api"

export default mutation({
  args: {
    tenantId: v.string(),
    vehicleId: v.optional(v.id("vehicles")),
    imageUrls: v.array(v.string()),
    checklist: v.optional(
      v.object({
        items: v.array(
          v.object({
            category: v.string(),
            location: v.string(),
            issue: v.string(),
            severity: v.optional(v.number()),
            notes: v.optional(v.string()),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Create the assessment record
    const assessmentId = await ctx.db.insert("selfAssessments", {
      tenantId: args.tenantId,
      vehicleId: args.vehicleId,
      status: "pending",
      images: args.imageUrls,
      checklistSelections: args.checklist?.items || [],
      damageTagsAI: [], // Will be populated by AI analysis
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Schedule AI analysis if images exist
    if (args.imageUrls.length > 0) {
      await ctx.scheduler.runAfter(0, internal.assessments.analyzeImages, {
        assessmentId,
        tenantId: args.tenantId,
        imageUrls: args.imageUrls,
        checklist: args.checklist,
      })
    }

    return { assessmentId }
  },
})
