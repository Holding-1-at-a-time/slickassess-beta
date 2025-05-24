import { query } from "../../_generated/server"
import { v } from "convex/values"
import { createDefaultAssessmentTemplate } from "../../../utils/defaultAssessmentTemplate"

export default query({
  args: {
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the template for this tenant
    const template = await ctx.db
      .query("assessmentTemplates")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .first()

    // If no template exists, return the default template
    if (!template) {
      return createDefaultAssessmentTemplate()
    }

    return template.template
  },
})
