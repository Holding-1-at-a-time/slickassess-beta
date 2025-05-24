import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export default mutation({
  args: {
    assessmentId: v.id("selfAssessments"),
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

    // Get tenant configuration
    const tenant = await ctx.db.get(assessment.tenantId)
    if (!tenant) {
      throw new Error("Tenant not found")
    }

    const tenantConfig = {
      basePackagePrice: tenant.basePackagePrice || 0,
      technicianRate: tenant.technicianRate || 40, // Default $40/hour
      seasonalMultiplier: tenant.seasonalMultiplier || 1.0,
      loyaltyDiscount: tenant.loyaltyDiscount || 0,
    }

    // Get pricing rules for this tenant
    const pricingRules = await ctx.db
      .query("pricingRules")
      .withIndex("by_tenant_and_service", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("active"), true))
      .collect()

    // Initialize calculation variables
    let subtotal = 0
    let totalDuration = 0
    let extraDamageCharges = 0
    const customCharges = []
    const lineItems = []

    // Process checklist selections
    const checklistSelections = assessment.checklistSelections || []
    for (const item of checklistSelections) {
      const serviceKey = `${item.category}_${item.issue}`.toLowerCase()

      // Find matching pricing rule
      const rule = pricingRules.find(
        (r) => r.serviceName.toLowerCase() === serviceKey || r.serviceName.toLowerCase() === item.issue.toLowerCase(),
      )

      if (rule) {
        subtotal += rule.basePrice
        totalDuration += rule.duration
        lineItems.push({
          description: `${item.location} ${item.issue}`,
          price: rule.basePrice,
          duration: rule.duration,
        })
      } else {
        // Flag as custom charge
        customCharges.push({
          description: `${item.location} ${item.issue}`,
          needsReview: true,
        })
      }
    }

    // Process AI-detected damage tags
    const damageTagsAI = assessment.damageTagsAI || []
    for (const tag of damageTagsAI) {
      // Skip if already included in checklist
      const alreadyIncluded = checklistSelections.some((item) =>
        `${item.location} ${item.issue}`.toLowerCase().includes(tag.toLowerCase()),
      )

      if (alreadyIncluded) continue

      // Find matching pricing rule
      const rule = pricingRules.find((r) => tag.toLowerCase().includes(r.serviceName.toLowerCase()))

      if (rule) {
        extraDamageCharges += rule.basePrice
        totalDuration += rule.duration
        lineItems.push({
          description: `AI-detected: ${tag}`,
          price: rule.basePrice,
          duration: rule.duration,
          aiDetected: true,
        })
      } else {
        // Flag as custom charge
        customCharges.push({
          description: `AI-detected: ${tag}`,
          needsReview: true,
          aiDetected: true,
        })
      }
    }

    // Apply base package if applicable
    if (tenantConfig.basePackagePrice > 0) {
      subtotal += tenantConfig.basePackagePrice
      lineItems.push({
        description: "Base Package",
        price: tenantConfig.basePackagePrice,
        isPackage: true,
      })
    }

    // Calculate labor cost
    const laborCost = (totalDuration / 60) * tenantConfig.technicianRate // Convert minutes to hours

    // Apply seasonal multiplier
    const seasonalAdjustment = (subtotal + extraDamageCharges) * (tenantConfig.seasonalMultiplier - 1)

    // Apply loyalty discount
    const loyaltyDiscount = (subtotal + extraDamageCharges + seasonalAdjustment) * tenantConfig.loyaltyDiscount

    // Calculate total
    const totalCost = subtotal + extraDamageCharges + laborCost + seasonalAdjustment - loyaltyDiscount

    // Create itemized estimate
    const itemizedEstimate = {
      lineItems,
      customCharges,
      laborCost: {
        duration: totalDuration,
        rate: tenantConfig.technicianRate,
        cost: laborCost,
      },
      adjustments: [
        {
          description: "Seasonal Adjustment",
          multiplier: tenantConfig.seasonalMultiplier,
          amount: seasonalAdjustment,
        },
        {
          description: "Loyalty Discount",
          percentage: tenantConfig.loyaltyDiscount * 100,
          amount: -loyaltyDiscount,
        },
      ],
      subtotal,
      extraDamageCharges,
      totalCost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
    }

    // Update the assessment with the estimate
    await ctx.db.patch(args.assessmentId, {
      estimatedPrice: itemizedEstimate.totalCost,
      estimatedDuration: totalDuration,
      itemizedEstimate,
      updatedAt: Date.now(),
    })

    return {
      success: true,
      estimatedPrice: itemizedEstimate.totalCost,
      estimatedDuration: totalDuration,
      itemizedEstimate,
    }
  },
})
