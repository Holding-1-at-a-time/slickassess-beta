import { google } from "googleapis"
import { getEnvVar } from "./env"

interface EmailOptions {
  to: string
  subject: string
  body: string
  cc?: string
  bcc?: string
}

export async function sendEmail(options: EmailOptions): Promise<string> {
  try {
    // Validate required environment variables
    const emailAddress = getEnvVar("GOOGLE_SERVICE_ACCOUNT_EMAIL")
    const privateKey = getEnvVar("GOOGLE_PRIVATE_KEY")

    if (!emailAddress || !privateKey) {
      throw new Error("Missing required Gmail environment variables")
    }

    const auth = new google.auth.JWT({
      email: emailAddress,
      key: privateKey.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/gmail.send"],
      subject: emailAddress, // Impersonate this user
    })

    const gmail = google.gmail({ version: "v1", auth })

    // Validate email parameters
    if (!options.to || !options.subject) {
      throw new Error("Missing required email parameters")
    }

    // Create the email content
    const emailLines = [
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      options.body || "No content provided",
    ]

    if (options.cc) {
      emailLines.splice(1, 0, `Cc: ${options.cc}`)
    }

    if (options.bcc) {
      emailLines.splice(1, 0, `Bcc: ${options.bcc}`)
    }

    const rawEmail = emailLines.join("\r\n")
    const encodedEmail = Buffer.from(rawEmail)
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
    // Don't expose the actual error which might contain sensitive info
    throw new Error("Failed to send email")
  }
}
