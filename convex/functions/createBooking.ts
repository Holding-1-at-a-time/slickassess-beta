import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { GoogleCalendarClient } from "../../lib/googleCalendarClient"

export const createBooking = mutation({
  args: {
    tenantId: v.string(),
    vehicleId: v.string(),
    serviceType: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    notes: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Create the booking in Convex
      const bookingId = await ctx.db.insert("bookings", {
        tenantId: args.tenantId,
        vehicleId: args.vehicleId,
        serviceType: args.serviceType,
        startTime: args.startTime,
        endTime: args.endTime,
        status: "confirmed",
        notes: args.notes,
        customerEmail: args.customerEmail,
        customerName: args.customerName,
        customerPhone: args.customerPhone,
      })

      // Create the event in Google Calendar
      const googleCalendarClient = new GoogleCalendarClient()

      const summary = `${args.serviceType} - ${args.customerName || "Customer"}`
      const description = `
        Service: ${args.serviceType}
        Vehicle ID: ${args.vehicleId}
        ${args.notes ? `Notes: ${args.notes}` : ""}
        ${args.customerPhone ? `Phone: ${args.customerPhone}` : ""}
        Booking ID: ${bookingId}
      `

      const googleEventId = await googleCalendarClient.createEvent(
        summary,
        description,
        args.startTime,
        args.endTime,
        args.customerEmail,
      )

      // Update the booking with the Google Calendar event ID
      await ctx.db.patch(bookingId, {
        googleEventId,
      })

      return { bookingId, googleEventId }
    } catch (error) {
      console.error("Error creating booking:", error)
      throw new Error(`Failed to create booking: ${error}`)
    }
  },
})
