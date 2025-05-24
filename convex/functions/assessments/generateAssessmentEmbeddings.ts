import { internalAction } from "../../_generated/server"
import { v } from "convex/values"
import { api, internal } from "../../_generated/api"

export default internalAction({
  args: {
    assessmentId: v.id("assessments"),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the assessment
    const assessment = await ctx.runQuery(internal.assessments.getAssessmentById, {
      assessmentId: args.assessmentId,
      tenantId: args.tenantId,
    })

    if (!assessment) {
      throw new Error("Assessment not found")
    }

    // Create a text representation of the assessment
    const textParts: string[] = []

    // Add form data
    if (assessment.formData) {
      assessment.formData.sections.forEach((section) => {
        textParts.push(`Section: ${section.title}`)
        section.items.forEach((item) => {
          if (item.value) {
            textParts.push(`${item.label}: ${item.value}`)
          }
        })
      })
    }

    // Add AI analysis results
    if (assessment.aiAnalysis) {
      textParts.push("AI Analysis:")
      assessment.aiAnalysis.detectedIssues?.forEach((issue) => {
        textParts.push(`${issue.type} - ${issue.location}: ${issue.description} (Severity: ${issue.severity})`)
      })
      if (assessment.aiAnalysis.summary) {
        textParts.push(`Summary: ${assessment.aiAnalysis.summary}`)
      }
    }

    // Add vehicle information
    if (assessment.vehicle) {
      textParts.push(`Vehicle: ${assessment.vehicle.year} ${assessment.vehicle.make} ${assessment.vehicle.model}`)
    }

    const fullText = textParts.join("\n")

    // Generate embedding
    const embedding = await ctx.runAction(api.search.vectorSearch.generateEmbedding, {
      text: fullText,
    })

    // Store the embedding
    await ctx.runMutation(api.search.vectorSearch.storeEmbedding, {
      tenantId: args.tenantId,
      entityType: "assessment",
      entityId: args.assessmentId,
      text: fullText,
      embedding,
      metadata: {
        title: `Assessment ${assessment.vehicle?.licensePlate || args.assessmentId}`,
        category: assessment.type || "general",
        tags: [assessment.status, assessment.vehicle?.make, assessment.vehicle?.model].filter(Boolean) as string[],
      },
    })

    return { success: true }
  },
})
