import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export default mutation({
  args: {
    assessmentId: v.id("assessments"),
    tenantId: v.string(),
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

    if (!assessment.aiAnalysis) {
      throw new Error("Assessment has not been analyzed yet")
    }

    // Get pricing rules for this tenant
    const pricingRules = await ctx.db
      .query("pricingRules")
      .withIndex("by_tenant_and_service", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect()

    // Calculate estimate based on detected issues
    let totalPrice = 0
    let totalDuration = 0

    for (const issue of assessment.aiAnalysis.detectedIssues) {
      // Find matching pricing rule
      const rule = pricingRules.find((r) => r.serviceName === issue.type)

      if (rule) {
        // Apply severity multiplier (1-5 scale)
        const severityMultiplier = 0.8 + issue.severity * 0.1 // 0.9 to 1.3

        // Apply confidence adjustment (only if high confidence)
        const confidenceAdjustment = issue.confidence > 0.8 ? 1 : 0.8

        // Calculate price for this issue
        const issuePrice = rule.basePrice * severityMultiplier * confidenceAdjustment

        // Calculate duration for this issue
        const issueDuration = rule.duration * severityMultiplier

        totalPrice += issuePrice
        totalDuration += issueDuration
      }
    }

    // Apply any seasonal or other multipliers (simplified for now)
    // In a real implementation, you would check for holidays, weekends, etc.
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6
    const weekendMultiplier = isWeekend ? 1.2 : 1

    totalPrice *= weekendMultiplier

    // Update the assessment with the estimate
    await ctx.db.patch(args.assessmentId, {
      estimatedPrice: Math.round(totalPrice * 100) / 100, // Round to 2 decimal places
      estimatedDuration: Math.ceil(totalDuration), // Round up to nearest minute
      updatedAt: Date.now(),
    })

    return {
      estimatedPrice: Math.round(totalPrice * 100) / 100,
      estimatedDuration: Math.ceil(totalDuration),
    }
  },
})
