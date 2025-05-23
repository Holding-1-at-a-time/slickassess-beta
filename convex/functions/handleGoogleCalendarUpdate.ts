import { v } from "convex/values"
import { mutation } from "./_generated/server"

export default mutation({
  args: {
    eventId: v.string(),
    status: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
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

    // Prepare updates
    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    }

    // Update status if provided
    if (args.status) {
      switch (args.status.toLowerCase()) {
        case "confirmed":
          updates.status = "confirmed"
          break
        case "cancelled":
          updates.status = "canceled"
          break
        case "tentative":
          updates.status = "pending"
          break
      }
    }

    // Update times if provided
    if (args.startTime) {
      updates.startTime = args.startTime
    }

    if (args.endTime) {
      updates.endTime = args.endTime

      // Recalculate duration if both start and end times are provided
      if (args.startTime) {
        const startTime = new Date(args.startTime)
        const endTime = new Date(args.endTime)
        updates.duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))
      }
    }

    // Update the booking
    await ctx.db.patch(booking._id, updates)

    return { success: true, bookingId: booking._id }
  },
})
