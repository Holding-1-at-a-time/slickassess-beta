import { type NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Google
    const channelId = request.headers.get("x-goog-channel-id")
    const resourceId = request.headers.get("x-goog-resource-id")
    const resourceState = request.headers.get("x-goog-resource-state")

    if (!channelId || !resourceId) {
      console.error("Missing required headers")
      return NextResponse.json({ error: "Missing required headers" }, { status: 400 })
    }

    console.log(`Received webhook: ${resourceState} for channel ${channelId}`)

    // Parse the request body
    const body = await request.json()

    // Handle different resource states
    switch (resourceState) {
      case "sync":
        // Initial sync message, no action needed
        console.log("Received sync notification")
        break

      case "exists":
      case "update":
        // Calendar event was created or updated
        if (body.id) {
          // Update the booking in Convex
          await convex.mutation(api.functions.handleGoogleCalendarUpdate, {
            eventId: body.id,
            status: body.status,
            startTime: body.start?.dateTime,
            endTime: body.end?.dateTime,
          })
        }
        break

      case "delete":
        // Calendar event was deleted
        if (body.id) {
          // Update the booking in Convex
          await convex.mutation(api.functions.handleGoogleCalendarDelete, {
            eventId: body.id,
          })
        }
        break

      default:
        console.log(`Unknown resource state: ${resourceState}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error handling Google Calendar webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Handle the verification request from Google
export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get("hub.challenge")

  if (challenge) {
    // Return the challenge to verify the webhook
    return new Response(challenge, {
      headers: { "Content-Type": "text/plain" },
    })
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}
