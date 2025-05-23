import { google, type gmail_v1 } from "googleapis"

export interface EmailOptions {
  to: string
  subject: string
  body: string
  isHtml?: boolean
}

export class GmailClient {
  private gmail: gmail_v1.Gmail

  constructor() {
    // Initialize the Gmail API client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/gmail.send"],
    })

    this.gmail = google.gmail({ version: "v1", auth })
  }

  /**
   * Send an email using Gmail API
   */
  async sendEmail(options: EmailOptions): Promise<string> {
    try {
      // Create the email content
      const contentType = options.isHtml ? "text/html" : "text/plain"
      const emailLines = [
        `To: ${options.to}`,
        `Subject: ${options.subject}`,
        "Content-Type: " + contentType + "; charset=utf-8",
        "",
        options.body,
      ]

      const email = emailLines.join("\r\n")

      // Encode the email in base64
      const encodedEmail = Buffer.from(email)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "")

      // Send the email
      const response = await this.gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedEmail,
        },
      })

      return response.data.id || ""
    } catch (error) {
      console.error("Error sending email:", error)
      throw new Error("Failed to send email")
    }
  }

  /**
   * Send a booking reminder email
   */
  async sendBookingReminder(
    to: string,
    bookingDetails: {
      customerName: string
      serviceName: string
      dateTime: string
      location: string
      vehicleName: string
      bookingId: string
    },
  ): Promise<string> {
    const subject = `Reminder: Your ${bookingDetails.serviceName} appointment tomorrow`

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Appointment Reminder</h2>
        <p>Hello ${bookingDetails.customerName},</p>
        <p>This is a friendly reminder about your upcoming appointment:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Service:</strong> ${bookingDetails.serviceName}</p>
          <p><strong>Date & Time:</strong> ${bookingDetails.dateTime}</p>
          <p><strong>Location:</strong> ${bookingDetails.location}</p>
          <p><strong>Vehicle:</strong> ${bookingDetails.vehicleName}</p>
        </div>
        <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
        <p>Thank you for choosing our service!</p>
        <p>SlickAssess Team</p>
        <p style="font-size: 12px; color: #777;">Booking reference: ${bookingDetails.bookingId}</p>
      </div>
    `

    return this.sendEmail({
      to,
      subject,
      body: htmlBody,
      isHtml: true,
    })
  }
}

// Factory function to create a client instance
export function createGmailClient(): GmailClient {
  return new GmailClient()
}
