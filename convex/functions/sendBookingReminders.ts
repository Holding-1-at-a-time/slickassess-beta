import { internalAction } from "../_generated/server"
import { sendEmail } from "../../lib/gmailClient"

// This function would be scheduled to run daily
export const sendBookingReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      // Get bookings for tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const tomorrowEnd = new Date(tomorrow)
      tomorrowEnd.setHours(23, 59, 59, 999)

      const bookings = await ctx.runQuery("listBookingsByDateRange", {
        startDate: tomorrow.toISOString(),
        endDate: tomorrowEnd.toISOString(),
        status: "confirmed",
      })

      // Send reminder for each booking
      for (const booking of bookings) {
        if (booking.customerEmail) {
          await sendEmail({
            to: booking.customerEmail,
            subject: `Reminder: Your appointment tomorrow at ${new Date(booking.startTime).toLocaleTimeString()}`,
            body: `
              <h2>Appointment Reminder</h2>
              <p>This is a friendly reminder about your appointment tomorrow:</p>
              <ul>
                <li><strong>Service:</strong> ${booking.serviceType}</li>
                <li><strong>Time:</strong> ${new Date(booking.startTime).toLocaleString()}</li>
                <li><strong>Duration:</strong> ${Math.round(
                  (new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000,
                )} minutes</li>
              </ul>
              <p>If you need to reschedule, please contact us as soon as possible.</p>
              <p>Thank you!</p>
            `,
          })
        }
      }

      return { success: true, remindersSent: bookings.length }
    } catch (error) {
      console.error("Error sending booking reminders:", error)
      throw new Error(`Failed to send booking reminders: ${error}`)
    }
  },
})
