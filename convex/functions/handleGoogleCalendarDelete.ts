import { v } from "convex/values"
import { mutation } from "./_generated/server"

export default mutation({
  args: {
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the booking with this Google Calendar event ID
    const bookings = await ctx.db
      .query("bookings")
      .filter((q) => q.eq(q.field("googleEventId"), args.eventId))
      .collect()

    if (bookings.length === 0) {
      console.log(`No booking found for Google Calendar event ID: ${args.eventId}`)
      return { success: false, error: "Booking not found" }
    }

    const booking = bookings[0]

    // Update the booking status to canceled
    await ctx.db.patch(booking._id, {
      status: "canceled",
      updatedAt: new Date().toISOString(),
    })

    return { success: true, bookingId: booking._id }
  },
})
