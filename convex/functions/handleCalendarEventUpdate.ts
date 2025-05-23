import { v } from "convex/values"
import { mutation } from "./_generated/server"

export default mutation({
  args: {
    googleEventId: v.string(),
    eventData: v.any(), // Calendar event data
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

    // Update the booking based on the event data
    // This is a simplified example - in a real implementation, you would parse the event data
    // and update the booking accordingly
    const eventStatus = args.eventData.status
    let bookingStatus = booking.status

    if (eventStatus === "cancelled") {
      bookingStatus = "canceled"
    } else if (eventStatus === "confirmed") {
      bookingStatus = "confirmed"
    }

    // Update the booking
    await ctx.db.patch(booking._id, {
      status: bookingStatus,
      updatedAt: Date.now(),
    })
  },
})
