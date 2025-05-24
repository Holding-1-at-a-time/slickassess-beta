import { action, mutation, query } from "../_generated/server"
import { v } from "convex/values"
import { api } from "../_generated/api"

// Action to generate embeddings using OpenAI
export const generateEmbedding = action({
  args: {
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: args.text,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to generate embedding: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data[0].embedding as number[]
  },
})

// Mutation to store embeddings
export const storeEmbedding = mutation({
  args: {
    tenantId: v.string(),
    entityType: v.union(v.literal("assessment"), v.literal("vehicle"), v.literal("analysis"), v.literal("description")),
    entityId: v.string(),
    text: v.string(),
    embedding: v.array(v.float64()),
    metadata: v.optional(
      v.object({
        title: v.optional(v.string()),
        category: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Check if embedding already exists
    const existing = await ctx.db
      .query("embeddings")
      .withIndex("by_entity", (q) => q.eq("entityType", args.entityType).eq("entityId", args.entityId))
      .first()

    if (existing) {
      // Update existing embedding
      await ctx.db.patch(existing._id, {
        embedding: args.embedding,
        text: args.text,
        metadata: {
          ...existing.metadata,
          ...args.metadata,
          createdAt: Date.now(),
        },
      })
      return { id: existing._id, updated: true }
    }

    // Create new embedding
    const id = await ctx.db.insert("embeddings", {
      tenantId: args.tenantId,
      entityType: args.entityType,
      entityId: args.entityId,
      embedding: args.embedding,
      text: args.text,
      metadata: {
        ...args.metadata,
        createdAt: Date.now(),
      },
    })

    return { id, updated: false }
  },
})

// Query for similar items using vector search
export const searchSimilar = query({
  args: {
    tenantId: v.string(),
    embedding: v.array(v.float64()),
    entityType: v.optional(
      v.union(v.literal("assessment"), v.literal("vehicle"), v.literal("analysis"), v.literal("description")),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10

    const results = await ctx.db.query("embeddings").withVectorSearch("by_embedding", {
      vector: args.embedding,
      limit,
      filter: (q) => {
        let filter = q.eq("tenantId", args.tenantId)
        if (args.entityType) {
          filter = q.and(filter, q.eq("entityType", args.entityType))
        }
        return filter
      },
    })

    return results.map((result) => ({
      ...result,
      score: result._score,
    }))
  },
})

// Action to search by text
export const searchByText = action({
  args: {
    tenantId: v.string(),
    query: v.string(),
    entityType: v.optional(
      v.union(v.literal("assessment"), v.literal("vehicle"), v.literal("analysis"), v.literal("description")),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Generate embedding for the query
    const embedding = await ctx.runAction(api.search.vectorSearch.generateEmbedding, {
      text: args.query,
    })

    // Search for similar items
    const results = await ctx.runQuery(api.search.vectorSearch.searchSimilar, {
      tenantId: args.tenantId,
      embedding,
      entityType: args.entityType,
      limit: args.limit,
    })

    return results
  },
})
