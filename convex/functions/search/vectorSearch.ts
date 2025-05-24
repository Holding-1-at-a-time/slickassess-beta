import { action } from "../../_generated/server"
import { v } from "convex/values"
import { openai } from "@ai-sdk/openai"
import { embed } from "ai"
import { ConvexError } from "convex/values"

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
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Validate input
      if (!args.query.trim()) {
        throw new ConvexError({
          code: "INVALID_ARGUMENT",
          message: "Search query cannot be empty",
        })
      }

      // Generate embedding for the query
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: args.query,
      })

      // Set defaults
      const limit = Math.min(args.limit ?? 10, 50) // Max 50 results per page
      const threshold = args.threshold ?? 0.7

      // Parse cursor if provided
      let cursorObj = undefined
      if (args.cursor) {
        try {
          cursorObj = JSON.parse(args.cursor)
        } catch (e) {
          throw new ConvexError({
            code: "INVALID_CURSOR",
            message: "Invalid cursor format",
          })
        }
      }

      // Perform vector search with pagination
      const results = await ctx.vectorSearch("embeddings", "by_embedding", {
        vector: Array.from(embedding),
        limit: limit + 1, // Get one extra to check if there are more results
        filter: (q) => {
          let filter = q.eq("tenantId", args.tenantId)
          if (args.contentTypes && args.contentTypes.length > 0) {
            filter = filter.and(args.contentTypes.map((type) => q.eq("contentType", type)).reduce((a, b) => a.or(b)))
          }
          return filter
        },
        cursor: cursorObj,
      })

      // Check if there are more results
      const hasMore = results.length > limit
      const paginatedResults = hasMore ? results.slice(0, limit) : results

      // Filter by threshold
      const filteredResults = paginatedResults.filter((r) => r._score >= threshold)

      // Generate next cursor
      const nextCursor = hasMore ? JSON.stringify(results[limit - 1]._cursor) : null

      // Log search for analytics
      await ctx.runMutation("search/logSearch", {
        tenantId: args.tenantId,
        query: args.query,
        searchType: "vector",
        resultsCount: filteredResults.length,
        filters: args.contentTypes ? { contentTypes: args.contentTypes } : undefined,
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
        hasMore,
        nextCursor,
      }
    } catch (error) {
      console.error("Vector search error:", error)
      if (error instanceof ConvexError) {
        throw error
      }
      throw new ConvexError({
        code: "SEARCH_FAILED",
        message: "Failed to perform vector search",
        cause: error.message,
      })
    }
  },
})
