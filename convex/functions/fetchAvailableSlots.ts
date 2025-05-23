import { v } from "convex/values"
import { action } from "./_generated/server"
import { GoogleCalendarClient } from "../../lib/googleCalendarClient"

export default action({
  args: {
    tenantId: v.string(),
    startDate: v.string(), // ISO string
    endDate: v.string(), // ISO string
    duration: v.number(), // in minutes
  },
  handler: async (ctx, args) => {
    // In a real implementation, you would fetch the tenant's calendar ID from the database
    // For now, we'll use the environment variable
    const calendarId = process.env.GOOGLE_CALENDAR_ID || ""

    if (!calendarId) {
      throw new Error("Calendar ID not configured for this tenant")
    }

    const calendarClient = new GoogleCalendarClient(calendarId)

    const startDate = new Date(args.startDate)
    const endDate = new Date(args.endDate)

    const availableSlots = await calendarClient.getAvailableSlots(startDate, endDate, args.duration)

    return availableSlots.map((slot) => ({
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
    }))
  },
})
