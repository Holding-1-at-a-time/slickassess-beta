import { v } from "convex/values"
import { mutation, action } from "./_generated/server"
import { GoogleCalendarClient } from "../../lib/googleCalendarClient"

// First, create a mutation to store the booking in Convex
export const createBookingRecord = mutation({
  args: {
    tenantId: v.string(),
    vehicleId: v.string(),
    customerId: v.string(),
    serviceType: v.string(),
    startTime: v.string(), // ISO string
    endTime: v.string(), // ISO string
    duration: v.number(), // in minutes
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const startTime = new Date(args.startTime).getTime()
    const endTime = new Date(args.endTime).getTime()

    const bookingId = await ctx.db.insert("bookings", {
      tenantId: args.tenantId,
      vehicleId: args.vehicleId,
      customerId: args.customerId,
      serviceType: args.serviceType,
      startTime,
      endTime,
      duration: args.duration,
      status: "pending",
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return bookingId
  },
})

// Then, create an action to create the event in Google Calendar
export const createCalendarEvent = action({
  args: {
    bookingId: v.id("bookings"),
    tenantId: v.string(),
    vehicleId: v.string(),
    serviceType: v.string(),
    startTime: v.string(), // ISO string
    endTime: v.string(), // ISO string
    customerEmail: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // In a real implementation, you would fetch the tenant's calendar ID from the database
    const calendarId = process.env.GOOGLE_CALENDAR_ID || ""

    if (!calendarId) {
      throw new Error("Calendar ID not configured for this tenant")
    }

    const calendarClient = new GoogleCalendarClient(calendarId)

    // Get vehicle details for the event summary
    const vehicleDetails = await ctx.runQuery("getVehicleById", {
      tenantId: args.tenantId,
      vehicleId: args.vehicleId,
    })

    const summary = `${args.serviceType} - ${vehicleDetails?.name || "Vehicle"}`
    const description = args.notes || `Booking for ${args.serviceType}`

    const eventId = await calendarClient.createEvent({
      summary,
      description,
      startTime: new Date(args.startTime),
      endTime: new Date(args.endTime),
      attendeeEmail: args.customerEmail,
    })

    // Update the booking record with the Google Calendar event ID
    await ctx.runMutation("updateBookingWithEventId", {
      bookingId: args.bookingId,
      googleEventId: eventId,
      status: "confirmed",
    })

    return { eventId }
  },
})

// Helper mutation to update the booking with the Google Calendar event ID
export const updateBookingWithEventId = mutation({
  args: {
    bookingId: v.id("bookings"),
    googleEventId: v.string(),
    status: v.union(v.literal("confirmed"), v.literal("pending"), v.literal("canceled"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      googleEventId: args.googleEventId,
      status: args.status,
      updatedAt: Date.now(),
    })
  },
})
