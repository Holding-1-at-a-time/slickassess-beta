import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export default mutation({
  args: {
    assessmentId: v.id("assessments"),
    tenantId: v.string(),
    aiAnalysis: v.object({
      detectedIssues: v.array(
        v.object({
          type: v.string(),
          location: v.string(),
          severity: v.number(),
          confidence: v.number(),
        }),
      ),
      summary: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // Get the assessment
    const assessment = await ctx.db.get(args.assessmentId)

    if (!assessment) {
      throw new Error("Assessment not found")
    }

    if (assessment.tenantId !== args.tenantId) {
      throw new Error("Unauthorized")
    }

    // Update the assessment with the AI analysis
    await ctx.db.patch(args.assessmentId, {
      aiAnalysis: args.aiAnalysis,
      status: "in_progress",
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})
