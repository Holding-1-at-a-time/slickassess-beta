import { v } from "convex/values"
import { internalAction } from "./_generated/server"
import { google } from "googleapis"
import { JWT } from "google-auth-library"

export default internalAction({
  args: {
    bookingId: v.id("bookings"),
    tenantId: v.string(),
    vehicleId: v.string(),
    serviceType: v.string(),
    startTime: v.number(), // Unix timestamp
  },
  handler: async (ctx, args) => {
    // Get vehicle and customer details
    const vehicle = await ctx.runQuery("getVehicleById", {
      tenantId: args.tenantId,
      vehicleId: args.vehicleId,
    })

    const booking = await ctx.runQuery("getBookingById", {
      bookingId: args.bookingId,
    })

    if (!vehicle || !booking) {
      throw new Error("Vehicle or booking not found")
    }

    // Get customer email
    const customer = await ctx.runQuery("getCustomerById", {
      tenantId: args.tenantId,
      customerId: booking.customerId,
    })

    if (!customer || !customer.email) {
      throw new Error("Customer email not found")
    }

    // Format the date and time
    const bookingDate = new Date(args.startTime)
    const formattedDate = bookingDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const formattedTime = bookingDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })

    // Set up Gmail API client
    const credentials = {
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/gmail.send"],
    }

    const auth = new JWT(credentials)
    const gmail = google.gmail({ version: "v1", auth })

    // Compose the email
    const emailSubject = `Reminder: Your appointment for ${args.serviceType} tomorrow`
    const emailBody = `
      <html>
        <body>
          <h2>Appointment Reminder</h2>
          <p>Hello,</p>
          <p>This is a reminder about your upcoming appointment:</p>
          <ul>
            <li><strong>Service:</strong> ${args.serviceType}</li>
            <li><strong>Vehicle:</strong> ${vehicle.name}</li>
            <li><strong>Date:</strong> ${formattedDate}</li>
            <li><strong>Time:</strong> ${formattedTime}</li>
          </ul>
          <p>If you need to reschedule, please contact us as soon as possible.</p>
          <p>Thank you,<br>SlickAssess Team</p>
        </body>
      </html>
    `

    // Create the email in base64 format
    const email = [
      "Content-Type: text/html; charset=utf-8",
      "MIME-Version: 1.0",
      `To: ${customer.email}`,
      "From: SlickAssess <noreply@slickassess.com>",
      `Subject: ${emailSubject}`,
      "",
      emailBody,
    ].join("\r\n")

    const encodedEmail = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")

    // Send the email
    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedEmail,
      },
    })

    return { success: true }
  },
})
