import { v } from "convex/values"
import { internalQuery } from "./_generated/server"

export default internalQuery({
  args: {
    startTime: v.number(), // Unix timestamp
    endTime: v.number(), // Unix timestamp
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_start_time", (q) => q.gte("startTime", args.startTime).lt("startTime", args.endTime))
      .filter((q) => q.eq(q.field("status"), "confirmed").eq(q.field("reminderSent"), false))
      .collect()
  },
})
