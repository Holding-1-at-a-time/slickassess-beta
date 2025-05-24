import { action } from "../../_generated/server"
import { v } from "convex/values"
import { api } from "../../_generated/api"

export default action({
  args: {
    query: v.string(),
    tenantId: v.string(),
    searchTypes: v.optional(v.array(v.union(v.literal("text"), v.literal("vector")))),
    contentTypes: v.optional(
      v.array(
        v.union(
          v.literal("assessment"),
          v.literal("vehicle"),
          v.literal("damage_description"),
          v.literal("service_description"),
          v.literal("customer_note"),
        ),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchTypes = args.searchTypes ?? ["text", "vector"]
    const limit = args.limit ?? 20
    const results: any[] = []

    // Perform text search if enabled
    if (searchTypes.includes("text")) {
      const textResults = await ctx.runQuery(api.search.textSearch, {
        query: args.query,
        tenantId: args.tenantId,
        contentTypes: args.contentTypes,
        limit,
      })
      results.push(...textResults.results.map((r) => ({ ...r, searchType: "text" })))
    }

    // Perform vector search if enabled
    if (searchTypes.includes("vector")) {
      const vectorResults = await ctx.runAction(api.search.vectorSearch, {
        query: args.query,
        tenantId: args.tenantId,
        contentTypes: args.contentTypes,
        limit,
      })
      results.push(...vectorResults.results.map((r) => ({ ...r, searchType: "vector" })))
    }

    // Deduplicate and sort by relevance
    const uniqueResults = new Map()
    for (const result of results) {
      const key = result.contentId
      if (!uniqueResults.has(key) || result.score > uniqueResults.get(key).score) {
        uniqueResults.set(key, result)
      }
    }

    const sortedResults = Array.from(uniqueResults.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    // Log search
    await ctx.runMutation(api.search.logSearch, {
      tenantId: args.tenantId,
      query: args.query,
      searchType: "hybrid",
      resultsCount: sortedResults.length,
    })

    return {
      results: sortedResults,
      totalResults: sortedResults.length,
      searchTypes: searchTypes,
    }
  },
})
