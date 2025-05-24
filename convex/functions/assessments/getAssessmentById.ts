import { query } from "../../_generated/server"
import { v } from "convex/values"

export default query({
  args: {
    assessmentId: v.id("assessments"),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const assessment = await ctx.db.get(args.assessmentId)

    if (!assessment) {
      return null
    }

    if (assessment.tenantId !== args.tenantId) {
      // For security, don't reveal that the assessment exists
      return null
    }

    return assessment
  },
})
