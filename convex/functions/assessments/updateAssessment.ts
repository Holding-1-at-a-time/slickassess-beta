import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export default mutation({
  args: {
    assessmentId: v.id("assessments"),
    tenantId: v.string(),
    updates: v.object({
      status: v.optional(
        v.union(
          v.literal("pending"),
          v.literal("in_progress"),
          v.literal("completed"),
          v.literal("approved"),
          v.literal("rejected"),
        ),
      ),
      updatedAt: v.number(),
    }),
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

    // Get the assessment
    const assessment = await ctx.db.get(args.assessmentId)

    if (!assessment) {
      throw new Error("Assessment not found")
    }

    if (assessment.tenantId !== args.tenantId) {
      throw new Error("Unauthorized: Assessment does not belong to this tenant")
    }

    // Update the assessment
    await ctx.db.patch(args.assessmentId, args.updates)

    return { success: true }
  },
})
