import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export default mutation({
  args: {
    tenantId: v.string(),
    query: v.string(),
    searchType: v.union(v.literal("text"), v.literal("vector"), v.literal("hybrid")),
    resultsCount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return
    }

    await ctx.db.insert("searchHistory", {
      tenantId: args.tenantId,
      userId: identity.subject,
      query: args.query,
      searchType: args.searchType,
      resultsCount: args.resultsCount,
      createdAt: Date.now(),
    })
  },
})
