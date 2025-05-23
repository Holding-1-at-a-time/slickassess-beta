import { v } from "convex/values"
import { action } from "./_generated/server"
import { createGoogleCalendarClient, type AvailableTimeSlot } from "../../lib/googleCalendarClient"

export default action({
  args: {
    tenantId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    durationMinutes: v.number(),
    serviceType: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<AvailableTimeSlot[]> => {
    // Validate the input dates
    const startDateObj = new Date(args.startDate)
    const endDateObj = new Date(args.endDate)

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      throw new Error("Invalid date format")
    }

    if (startDateObj >= endDateObj) {
      throw new Error("Start date must be before end date")
    }

    if (args.durationMinutes <= 0) {
      throw new Error("Duration must be positive")
    }

    try {
      // Get the tenant's calendar ID (in a real app, you'd fetch this from your database)
      // For now, we'll use the default calendar ID from environment variables
      const calendarClient = createGoogleCalendarClient()

      // Fetch available slots
      const availableSlots = await calendarClient.fetchAvailableSlots(
        args.startDate,
        args.endDate,
        args.durationMinutes,
      )

      return availableSlots
    } catch (error) {
      console.error("Error fetching available slots:", error)
      throw new Error("Failed to fetch available time slots")
    }
  },
})
