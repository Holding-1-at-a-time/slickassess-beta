import { internalAction } from "../../_generated/server"
import { v } from "convex/values"
import { analyzeImagesWithGPT4V } from "../../../lib/aiImageAnalysis"

export default internalAction({
  args: {
    assessmentId: v.id("assessments"),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the assessment
    const assessment = await ctx.runQuery("assessments/getAssessmentById", {
      assessmentId: args.assessmentId,
      tenantId: args.tenantId,
    })

    if (!assessment) {
      throw new Error("Assessment not found")
    }

    if (!assessment.images || assessment.images.length === 0) {
      throw new Error("No images to analyze")
    }

    try {
      // Call the AI service to analyze the images
      const aiAnalysis = await analyzeImagesWithGPT4V(assessment.images, assessment.formData)

      // Update the assessment with the AI analysis
      await ctx.runMutation("assessments/updateAssessmentAIAnalysis", {
        assessmentId: args.assessmentId,
        tenantId: args.tenantId,
        aiAnalysis,
      })

      // Calculate estimate based on AI analysis
      await ctx.runMutation("assessments/calculateEstimate", {
        assessmentId: args.assessmentId,
        tenantId: args.tenantId,
      })

      return { success: true }
    } catch (error) {
      console.error("Error analyzing images:", error)

      // Update the assessment status to indicate analysis failed
      await ctx.runMutation("assessments/updateAssessment", {
        assessmentId: args.assessmentId,
        tenantId: args.tenantId,
        updates: {
          status: "in_progress",
          updatedAt: Date.now(),
        },
      })

      throw error
    }
  },
})
