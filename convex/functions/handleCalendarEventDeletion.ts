import { v } from "convex/values"
import { mutation } from "./_generated/server"

export default mutation({
  args: {
    googleEventId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the booking with this Google Calendar event ID
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_google_event_id", (q) => q.eq("googleEventId", args.googleEventId))
      .collect()

    if (bookings.length === 0) {
      console.warn(`No booking found for Google Calendar event ID: ${args.googleEventId}`)
      return
    }

    const booking = bookings[0]

    // Update the booking status to canceled
    await ctx.db.patch(booking._id, {
      status: "canceled",
      updatedAt: Date.now(),
    })
  },
})
