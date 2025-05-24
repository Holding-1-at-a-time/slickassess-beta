import { mutation } from "../../_generated/server"
import { v } from "convex/values"
import { createDefaultAssessmentTemplate } from "../../../utils/defaultAssessmentTemplate"

export default mutation({
  args: {
    tenantId: v.string(),
    template: v.optional(
      v.object({
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
    ),
  },
  handler: async (ctx, args) => {
    // Verify the user has access to this tenant
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    // Check if the user has access to this tenant
    const user = await ctx.db
      .query("users")
      .withIndex("by_auth_id", (q) => q.eq("authId", identity.subject))
      .first()

    if (!user || user.tenantId !== args.tenantId) {
      throw new Error("Unauthorized: User does not have access to this tenant")
    }

    // Check if a template already exists for this tenant
    const existingTemplate = await ctx.db
      .query("assessmentTemplates")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .first()

    const template = args.template || createDefaultAssessmentTemplate()

    if (existingTemplate) {
      // Update existing template
      return await ctx.db.patch(existingTemplate._id, {
        template,
        updatedAt: Date.now(),
      })
    } else {
      // Create new template
      return await ctx.db.insert("assessmentTemplates", {
        tenantId: args.tenantId,
        template,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    }
  },
})
