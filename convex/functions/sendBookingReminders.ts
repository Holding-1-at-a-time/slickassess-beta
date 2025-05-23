import { cronJobs } from "convex/server"
import { internalAction } from "./_generated/server"
import { createGmailClient } from "../../lib/gmailClient"

// Define a cron job that runs every morning at 8 AM UTC
export const scheduledReminders = cronJobs.daily(
  {
    hourUTC: 8,
    minuteUTC: 0,
  },
  async (ctx) => {
    await ctx.runAction(internal.sendBookingReminders)
  },
)

// Internal action to send reminders
export const internal = {
  sendBookingReminders: internalAction({
    args: {},
    handler: async (ctx) => {
      const gmailClient = createGmailClient()

      // Get tomorrow's date
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const dayAfterTomorrow = new Date(tomorrow)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

      // Query bookings scheduled for tomorrow that haven't had reminders sent
      const bookings = await ctx.runQuery(internal.getUpcomingBookingsForReminders, {
        startDate: tomorrow.toISOString(),
        endDate: dayAfterTomorrow.toISOString(),
      })

      console.log(`Found ${bookings.length} bookings for tomorrow that need reminders`)

      // Send reminders for each booking
      for (const booking of bookings) {
        try {
          // Format the date and time for display
          const bookingDate = new Date(booking.startTime)
          const formattedDateTime = bookingDate.toLocaleString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
          })

          // Get vehicle details (in a real app, you'd fetch this from your database)
          const vehicleName = "Your Vehicle" // Placeholder

          // Send the reminder email
          await gmailClient.sendBookingReminder(booking.customerEmail, {
            customerName: booking.customerName,
            serviceName: booking.serviceType,
            dateTime: formattedDateTime,
            location: "Our Service Center", // Placeholder
            vehicleName,
            bookingId: booking._id,
          })

          // Update the booking to mark reminder as sent
          await ctx.runMutation(internal.markReminderSent, {
            bookingId: booking._id,
          })

          console.log(`Sent reminder for booking ${booking._id} to ${booking.customerEmail}`)
        } catch (error) {
          console.error(`Error sending reminder for booking ${booking._id}:`, error)
        }
      }

      return { sentReminders: bookings.length }
    },
  }),

  // Query to get upcoming bookings that need reminders
  getUpcomingBookingsForReminders: internalQuery({
    args: {
      startDate: v.string(),
      endDate: v.string(),
    },
    handler: async (ctx, args) => {
      return await ctx.db
        .query("bookings")
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "confirmed"),
            q.eq(q.field("reminderSent"), false),
            q.gte(q.field("startTime"), args.startDate),
            q.lt(q.field("startTime"), args.endDate),
          ),
        )
        .collect()
    },
  }),

  // Mutation to mark a reminder as sent
  markReminderSent: internalMutation({
    args: {
      bookingId: v.id("bookings"),
    },
    handler: async (ctx, args) => {
      await ctx.db.patch(args.bookingId, {
        reminderSent: true,
        reminderSentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    },
  }),
}

// Import necessary types
import { internalQuery, internalMutation } from "./_generated/server"
import { v } from "convex/values"
