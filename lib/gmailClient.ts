import { google } from "googleapis"

interface EmailOptions {
  to: string
  subject: string
  body: string
  cc?: string
  bcc?: string
}

export async function sendEmail(options: EmailOptions): Promise<string> {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/gmail.send"],
      subject: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, // Impersonate this user
    })

    const gmail = google.gmail({ version: "v1", auth })

    // Create the email content
    const emailLines = [
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      options.body,
    ]

    if (options.cc) {
      emailLines.splice(1, 0, `Cc: ${options.cc}`)
    }

    if (options.bcc) {
      emailLines.splice(1, 0, `Bcc: ${options.bcc}`)
    }

    const email = emailLines.join("\r\n")
    const encodedEmail = Buffer.from(email)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")

    // Send the email
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedEmail,
      },
    })

    return res.data.id || ""
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}
