import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"
import { internalAction } from "./_generated/server"

// Register the cron job to run every day at 8 AM
const sendRemindersJob = cronJobs.daily(
  {
    hour: 8, // 8 AM
    minute: 0,
  },
  internal.sendBookingReminders.sendDailyReminders,
)

export const sendDailyReminders = internalAction({
  handler: async (ctx) => {
    // Get all bookings scheduled for tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    const tomorrowStart = tomorrow.getTime()
    const tomorrowEnd = dayAfterTomorrow.getTime()

    // Query bookings for tomorrow that haven't had reminders sent
    const bookingsToRemind = await ctx.runQuery(internal.queries.getBookingsForReminders, {
      startTime: tomorrowStart,
      endTime: tomorrowEnd,
    })

    // Send reminders for each booking
    for (const booking of bookingsToRemind) {
      try {
        await ctx.runAction(internal.actions.sendBookingReminderEmail, {
          bookingId: booking._id,
          tenantId: booking.tenantId,
          vehicleId: booking.vehicleId,
          serviceType: booking.serviceType,
          startTime: booking.startTime,
        })

        // Mark reminder as sent
        await ctx.runMutation(internal.mutations.markReminderSent, {
          bookingId: booking._id,
        })
      } catch (error) {
        console.error(`Failed to send reminder for booking ${booking._id}:`, error)
      }
    }

    return { success: true, remindersCount: bookingsToRemind.length }
  },
})
