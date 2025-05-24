import { internalAction } from "../../_generated/server"
import { v } from "convex/values"
import { openai } from "@ai-sdk/openai"
import { embed } from "ai"

export default internalAction({
  args: {
    text: v.string(),
    tenantId: v.string(),
    contentId: v.string(),
    contentType: v.union(
      v.literal("assessment"),
      v.literal("vehicle"),
      v.literal("damage_description"),
      v.literal("service_description"),
      v.literal("customer_note"),
    ),
    metadata: v.optional(
      v.object({
        assessmentId: v.optional(v.id("selfAssessments")),
        vehicleId: v.optional(v.id("vehicles")),
        severity: v.optional(v.string()),
        category: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    try {
      // Generate embedding using OpenAI
      const { embedding } = await embed({
        model: openai.embedding("text-embedding-3-small"),
        value: args.text,
      })

      // Store the embedding
      await ctx.runMutation("embeddings/storeEmbedding", {
        tenantId: args.tenantId,
        contentId: args.contentId,
        contentType: args.contentType,
        text: args.text,
        embedding: Array.from(embedding),
        metadata: args.metadata,
      })

      return { success: true }
    } catch (error) {
      console.error("Error generating embedding:", error)
      throw new Error("Failed to generate embedding")
    }
  },
})
