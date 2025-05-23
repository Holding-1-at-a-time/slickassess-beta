import { action } from "../_generated/server"
import { v } from "convex/values"
import { GoogleCalendarClient } from "../../lib/googleCalendarClient"

export const fetchAvailableSlots = action({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const googleCalendarClient = new GoogleCalendarClient()

      const availableSlots = await googleCalendarClient.getAvailableSlots(args.startDate, args.endDate, args.duration)

      return availableSlots
    } catch (error) {
      console.error("Error fetching available slots:", error)
      throw new Error(`Failed to fetch available slots: ${error}`)
    }
  },
})
