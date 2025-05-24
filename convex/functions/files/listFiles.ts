import { query } from "../../_generated/server"
import { v } from "convex/values"

export default query({
  args: {
    tenantId: v.string(),
    category: v.optional(
      v.union(
        v.literal("assessment_image"),
        v.literal("vehicle_document"),
        v.literal("report"),
        v.literal("avatar"),
        v.literal("logo"),
      ),
    ),
    assessmentId: v.optional(v.id("selfAssessments")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized")
    }

    let query = ctx.db.query("files").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))

    if (args.category) {
      query = ctx.db
        .query("files")
        .withIndex("by_category", (q) => q.eq("tenantId", args.tenantId).eq("category", args.category))
    }

    if (args.assessmentId) {
      query = ctx.db.query("files").withIndex("by_assessment", (q) => q.eq("metadata.assessmentId", args.assessmentId))
    }

    const files = await query.order("desc").take(args.limit || 50)

    return files
  },
})
