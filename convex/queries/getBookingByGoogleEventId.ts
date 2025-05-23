import { query } from "../_generated/server"
import { v } from "convex/values"

export const getBookingByGoogleEventId = query({
  args: {
    googleEventId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("googleEventId"), args.googleEventId))
      .collect()
  },
})
