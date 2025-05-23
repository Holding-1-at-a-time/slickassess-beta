import { v } from "convex/values"
import { mutation } from "./_generated/server"
import { createGoogleCalendarClient, type BookingRequest } from "../../lib/googleCalendarClient"

export default mutation({
  args: {
    tenantId: v.string(),
    vehicleId: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    serviceType: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    notes: v.optional(v.string()),
    staffId: v.optional(v.string()),
    staffName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Calculate duration in minutes
    const startTime = new Date(args.startTime)
    const endTime = new Date(args.endTime)
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

    // Create the booking in Convex
    const bookingId = await ctx.db.insert("bookings", {
      tenantId: args.tenantId,
      vehicleId: args.vehicleId,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      serviceType: args.serviceType,
      startTime: args.startTime,
      endTime: args.endTime,
      duration: durationMinutes,
      status: "pending",
      notes: args.notes,
      staffId: args.staffId,
      staffName: args.staffName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reminderSent: false,
    })

    try {
      // Create the event in Google Calendar
      const calendarClient = createGoogleCalendarClient()

      const bookingRequest: BookingRequest = {
        title: `${args.serviceType} - ${args.customerName}`,
        description: `Service: ${args.serviceType}\nVehicle ID: ${args.vehicleId}\nNotes: ${args.notes || "None"}\nBooking ID: ${bookingId}`,
        startTime: args.startTime,
        endTime: args.endTime,
        attendeeEmail: args.customerEmail,
        serviceType: args.serviceType,
        vehicleId: args.vehicleId,
        tenantId: args.tenantId,
        staffId: args.staffId,
      }

      const calendarEvent = await calendarClient.createEvent(bookingRequest)

      // Update the booking with Google Calendar event ID
      await ctx.db.patch(bookingId, {
        googleEventId: calendarEvent.eventId,
        googleEventLink: calendarEvent.htmlLink,
        status: "confirmed",
        updatedAt: new Date().toISOString(),
      })

      return {
        bookingId,
        googleEventId: calendarEvent.eventId,
        googleEventLink: calendarEvent.htmlLink,
        status: "confirmed",
      }
    } catch (error) {
      console.error("Error creating Google Calendar event:", error)

      // The booking is still created in Convex, but without Google Calendar integration
      return {
        bookingId,
        status: "pending",
        error: "Failed to create Google Calendar event",
      }
    }
  },
})
