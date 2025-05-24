import { query } from "../../_generated/server"
import { v } from "convex/values"

export const getStream = query({
  args: {
    streamId: v.id("textStreams"),
  },
  handler: async (ctx, args) => {
    const stream = await ctx.db.get(args.streamId)

    if (!stream) {
      return null
    }

    return stream
  },
})

export const getStreamBySession = query({
  args: {
    sessionId: v.string(),
    type: v.optional(
      v.union(v.literal("assessment_analysis"), v.literal("chat_response"), v.literal("report_generation")),
    ),
  },
  handler: async (ctx, args) => {
    const query = ctx.db.query("textStreams").withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))

    const streams = await query.collect()

    if (args.type) {
      return streams.filter((s) => s.type === args.type)
    }

    return streams
  },
})
