import { mutation } from "../../_generated/server"
import { v } from "convex/values"
import { GoogleCalendarClient } from "../../../lib/googleCalendarClient"

export default mutation({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    try {
      // Get the booking
      const booking = await ctx.db.get(args.bookingId)
      if (!booking) {
        throw new Error("Booking not found")
      }

      // If there's a Google Calendar event ID, delete the event
      if (booking.googleEventId) {
        const googleCalendarClient = new GoogleCalendarClient()
        await googleCalendarClient.deleteEvent(booking.googleEventId)
      }

      // Delete the booking from Convex
      await ctx.db.delete(args.bookingId)

      return { success: true }
    } catch (error) {
      console.error("Error deleting booking:", error)
      throw new Error(`Failed to delete booking: ${error}`)
    }
  },
})
