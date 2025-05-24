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
      throw new Error("Unauthorized: Assessment does not belong to this tenant")
    }

    // Get pricing rules for this tenant
    const pricingRules = await ctx.db
      .query("pricingRules")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect()

    // If no AI analysis, use a default estimate
    if (!assessment.aiAnalysis) {
      const defaultEstimate = 150 // Default estimate in dollars
      const defaultDuration = 60 // Default duration in minutes

      await ctx.db.patch(args.assessmentId, {
        estimatedPrice: defaultEstimate,
        estimatedDuration: defaultDuration,
        updatedAt: Date.now(),
      })

      return {
        success: true,
        estimatedPrice: defaultEstimate,
        estimatedDuration: defaultDuration,
      }
    }

    // Calculate estimate based on detected issues
    let totalPrice = 0
    let totalDuration = 0

    // Base price for inspection
    const baseInspectionPrice = 50
    const baseInspectionDuration = 30
    totalPrice += baseInspectionPrice
    totalDuration += baseInspectionDuration

    // Add price for each detected issue
    for (const issue of assessment.aiAnalysis.detectedIssues) {
      // Find matching pricing rule or use default
      const matchingRule = pricingRules.find((rule) =>
        rule.serviceName.toLowerCase().includes(issue.type.toLowerCase()),
      )

      if (matchingRule) {
        // Apply severity multiplier (1-5 scale)
        const severityMultiplier = issue.severity / 3
        totalPrice += matchingRule.basePrice * severityMultiplier
        totalDuration += matchingRule.duration
      } else {
        // Default pricing if no rule matches
        const defaultPrice = issue.severity * 25 // $25 per severity point
        const defaultDuration = issue.severity * 10 // 10 minutes per severity point
        totalPrice += defaultPrice
        totalDuration += defaultDuration
      }
    }

    // Round to nearest dollar
    totalPrice = Math.round(totalPrice)

    // Update the assessment with the estimate
    await ctx.db.patch(args.assessmentId, {
      estimatedPrice: totalPrice,
      estimatedDuration: totalDuration,
      updatedAt: Date.now(),
    })

    return {
      success: true,
      estimatedPrice: totalPrice,
      estimatedDuration: totalDuration,
    }
  },
})
