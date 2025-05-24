import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export default mutation({
  args: {
    tenantId: v.string(),
    contentId: v.string(),
    contentType: v.union(
      v.literal("assessment"),
      v.literal("vehicle"),
      v.literal("damage_description"),
      v.literal("service_description"),
      v.literal("customer_note"),
    ),
    text: v.string(),
    embedding: v.array(v.float64()),
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
    // Check if embedding already exists
    const existing = await ctx.db
      .query("embeddings")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.eq(q.field("contentId"), args.contentId))
      .first()

    if (existing) {
      // Update existing embedding
      await ctx.db.patch(existing._id, {
        embedding: args.embedding,
        text: args.text,
        metadata: args.metadata,
      })
    } else {
      // Create new embedding
      await ctx.db.insert("embeddings", {
        tenantId: args.tenantId,
        contentId: args.contentId,
        contentType: args.contentType,
        text: args.text,
        embedding: args.embedding,
        metadata: args.metadata,
        createdAt: Date.now(),
      })
    }

    return { success: true }
  },
})
