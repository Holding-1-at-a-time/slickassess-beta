import { action } from "../../_generated/server"
import { v } from "convex/values"
import { openai } from "@ai-sdk/openai"
import { embed } from "ai"

export default action({
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
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      // Generate embedding for the query
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: args.query,
      })

      // Perform vector search
      const results = await ctx.vectorSearch("embeddings", "by_embedding", {
        vector: Array.from(embedding),
        limit: args.limit ?? 10,
        filter: (q) => {
          let filter = q.eq("tenantId", args.tenantId)
          if (args.contentTypes && args.contentTypes.length > 0) {
            filter = filter.and(args.contentTypes.map((type) => q.eq("contentType", type)).reduce((a, b) => a.or(b)))
          }
          return filter
        },
      })

      // Filter by threshold if provided
      const threshold = args.threshold ?? 0.7
      const filteredResults = results.filter((r) => r._score >= threshold)

      // Log search for analytics
      await ctx.runMutation("search/logSearch", {
        tenantId: args.tenantId,
        query: args.query,
        searchType: "vector",
        resultsCount: filteredResults.length,
      })

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
    } catch (error) {
      console.error("Vector search error:", error)
      throw new Error("Failed to perform vector search")
    }
  },
})
