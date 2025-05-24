import { mutation } from "../../_generated/server"
import { v } from "convex/values"
import { ConvexError } from "convex/values"

export const appendToStream = mutation({
  args: {
    streamId: v.id("textStreams"),
    content: v.string(),
    isComplete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db.get(args.streamId)

    if (!stream) {
      throw new ConvexError("Stream not found")
    }

    if (stream.status === "completed" || stream.status === "failed") {
      throw new ConvexError("Cannot append to a completed or failed stream")
    }

    const now = Date.now()
    const updates: any = {
      content: stream.content + args.content,
      status: args.isComplete ? "completed" : "streaming",
      updatedAt: now,
    }

    if (args.isComplete) {
      updates.completedAt = now
    }

    await ctx.db.patch(args.streamId, updates)

    return { success: true }
  },
})
