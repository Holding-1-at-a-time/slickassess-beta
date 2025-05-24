import { mutation } from "../../_generated/server"
import { v } from "convex/values"

export const createStream = mutation({
  args: {
    sessionId: v.string(),
    tenantId: v.string(),
    userId: v.optional(v.string()),
    type: v.union(v.literal("assessment_analysis"), v.literal("chat_response"), v.literal("report_generation")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const streamId = await ctx.db.insert("textStreams", {
      sessionId: args.sessionId,
      tenantId: args.tenantId,
      userId: args.userId,
      type: args.type,
      status: "pending",
      content: "",
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    })

    return streamId
  },
})
