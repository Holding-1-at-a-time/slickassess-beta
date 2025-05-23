import { mutation } from "../../_generated/server"
import { v } from "convex/values"
import { GoogleCalendarClient } from "../../../lib/googleCalendarClient"

export default mutation({
  args: {
    bookingId: v.id("bookings"),
    updates: v.object({
      serviceType: v.optional(v.string()),
      startTime: v.optional(v.string()),
      endTime: v.optional(v.string()),
      status: v.optional(v.union(v.literal("confirmed"), v.literal("pending"), v.literal("canceled"))),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    try {
      // Get the current booking
      const booking = await ctx.db.get(args.bookingId)
      if (!booking) {
        throw new Error("Booking not found")
      }

      // Update the booking in Convex
      await ctx.db.patch(args.bookingId, args.updates)

      // If there's a Google Calendar event ID, update the event
      if (booking.googleEventId) {
        const googleCalendarClient = new GoogleCalendarClient()

        const updates: any = {}

        if (args.updates.serviceType) {
          updates.summary = `${args.updates.serviceType} - ${booking.customerName || "Customer"}`
        }

        if (args.updates.startTime) {
          updates.startTime = args.updates.startTime
        }

        if (args.updates.endTime) {
          updates.endTime = args.updates.endTime
        }

        if (args.updates.notes) {
          updates.description = `
            Service: ${args.updates.serviceType || booking.serviceType}
            Vehicle ID: ${booking.vehicleId}
            ${args.updates.notes ? `Notes: ${args.updates.notes}` : ""}
            ${booking.customerPhone ? `Phone: ${booking.customerPhone}` : ""}
            Booking ID: ${args.bookingId}
          `
        }

        if (args.updates.status === "canceled") {
          updates.status = "cancelled"
        }

        await googleCalendarClient.updateEvent(booking.googleEventId, updates)
      }

      return { success: true }
    } catch (error) {
      console.error("Error updating booking:", error)
      throw new Error(`Failed to update booking: ${error}`)
    }
  },
})
