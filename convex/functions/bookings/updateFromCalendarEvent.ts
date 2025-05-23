import { internalAction } from "../../_generated/server"
import { v } from "convex/values"
import { GoogleCalendarClient } from "../../../lib/googleCalendarClient"

export default internalAction({
  args: {
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Get the event from Google Calendar
      const googleCalendarClient = new GoogleCalendarClient()
      const event = await googleCalendarClient.getEvent(args.eventId)

      if (!event) {
        throw new Error("Event not found")
      }

      // Find the booking with this Google Calendar event ID
      const bookings = await ctx.runQuery("bookings/getByGoogleEventId", {
        googleEventId: args.eventId,
      })

      if (bookings.length === 0) {
        console.log("No booking found for Google Calendar event ID:", args.eventId)
        return { success: false, reason: "No booking found" }
      }

      const booking = bookings[0]

      // Update the booking based on the event
      const updates: any = {}

      if (event.start?.dateTime) {
        updates.startTime = event.start.dateTime
      }

      if (event.end?.dateTime) {
        updates.endTime = event.end.dateTime
      }

      if (event.status === "cancelled") {
        updates.status = "canceled"
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        await ctx.runMutation("bookings/update", {
          bookingId: booking._id,
          updates,
        })
      }

      return { success: true }
    } catch (error) {
      console.error("Error updating booking from calendar event:", error)
      throw new Error(`Failed to update booking from calendar event: ${error}`)
    }
  },
})
