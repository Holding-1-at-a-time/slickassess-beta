import { query } from "../../_generated/server"
import { v } from "convex/values"

export const searchVehicles = query({
  args: {
    query: v.string(),
    threshold: v.optional(v.number()),
    page: v.optional(v.number()),
    pageSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query, threshold = 0.7, page = 1, pageSize = 10 } = args

    // Perform vector search
    const searchResults = await ctx.db
      .query("vehicles")
      .vectorSearch("embedding", {
        query,
        limit: 1000, // Get more results to filter by threshold
      })
      .collect()

    // Apply threshold filter BEFORE pagination
    const filteredResults = searchResults.filter((result) => result._score >= threshold)

    // Calculate pagination on filtered results
    const totalResults = filteredResults.length
    const totalPages = Math.ceil(totalResults / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize

    // Get page of filtered results
    const paginatedResults = filteredResults.slice(startIndex, endIndex)

    // Calculate hasMore based on filtered results
    const hasMore = page < totalPages

    return {
      results: paginatedResults,
      pagination: {
        page,
        pageSize,
        totalResults,
        totalPages,
        hasMore,
      },
      meta: {
        threshold,
        query,
        averageScore:
          paginatedResults.length > 0
            ? paginatedResults.reduce((sum, r) => sum + r._score, 0) / paginatedResults.length
            : 0,
      },
    }
  },
})

// Alternative approach with cursor-based pagination for better performance
export const searchVehiclesWithCursor = query({
  args: {
    query: v.string(),
    threshold: v.optional(v.number()),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { query, threshold = 0.7, cursor, limit = 10 } = args

    // Perform vector search with a buffer for filtering
    const searchLimit = limit * 2 // Get extra results to account for filtering
    const searchResults = await ctx.db
      .query("vehicles")
      .vectorSearch("embedding", {
        query,
        limit: searchLimit,
        cursor,
      })
      .collect()

    // Apply threshold filter
    const filteredResults = searchResults.filter((result) => result._score >= threshold)

    // Take only the requested limit
    const results = filteredResults.slice(0, limit)

    // Determine if there are more results
    const hasMore = filteredResults.length > limit

    // Get the cursor for the next page (last item's ID)
    const nextCursor = hasMore && results.length > 0 ? results[results.length - 1]._id : null

    return {
      results,
      nextCursor,
      hasMore,
      meta: {
        threshold,
        query,
        returnedCount: results.length,
      },
    }
  },
})
