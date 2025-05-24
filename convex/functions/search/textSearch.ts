import { query } from "../../_generated/server"
import { v } from "convex/values"

export default query({
  args: {
    query: v.string(),
    tenantId: v.string(),
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
    const limit = args.limit ?? 20
    const searchTerms = args.query.toLowerCase().split(" ").filter(Boolean)

    // Search in embeddings table
    const query = ctx.db.query("embeddings").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))

    // Get all results and filter in memory (in production, use full-text search)
    const allResults = await query.collect()

    const filteredResults = allResults
      .filter((result) => {
        // Filter by content type if specified
        if (args.contentTypes && args.contentTypes.length > 0) {
          if (!args.contentTypes.includes(result.contentType)) {
            return false
          }
        }

        // Check if all search terms are present
        const text = result.text.toLowerCase()
        return searchTerms.every((term) => text.includes(term))
      })
      .map((result) => {
        // Calculate a simple relevance score
        const text = result.text.toLowerCase()
        const score =
          searchTerms.reduce((acc, term) => {
            const occurrences = (text.match(new RegExp(term, "g")) || []).length
            return acc + occurrences
          }, 0) / searchTerms.length

        return {
          ...result,
          _score: score,
        }
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, limit)

    return {
      results: filteredResults.map((r) => ({
        id: r._id,
        score: r._score,
        contentId: r.contentId,
        contentType: r.contentType,
        text: r.text,
        metadata: r.metadata,
      })),
      totalResults: filteredResults.length,
    }
  },
})
