/**
 * Chat API endpoint
 *
 * Provides AI-powered booking assistance using Together AI and Convex
 *
 * @see {@link file://./README.md} for detailed documentation
 */

import { streamText } from "ai"
import { Together } from "together-ai"
import { api } from "@/convex/_generated/api"
import { ConvexHttpClient } from "convex/browser"
import { ValidationError, ExternalServiceError, ConfigurationError } from "@/lib/errors"
import { getConfig } from "@/lib/env-validator"
import { withMiddleware, withErrorHandler, withRateLimit } from "@/middleware/error-handler"
import type { NextRequest } from "next/server"

// Initialize Together AI client
let together: Together | null = null

try {
  const config = getConfig()
  together = new Together({ apiKey: config.TOGETHER_API_KEY })
} catch (error) {
  console.error("Failed to initialize Together AI client:", error)
}

// Initialize Convex client
let convex: ConvexHttpClient | null = null

try {
  const config = getConfig()
  convex = new ConvexHttpClient(config.NEXT_PUBLIC_CONVEX_URL)
} catch (error) {
  console.error("Failed to initialize Convex client:", error)
}

// Define the tools that the AI can use
const tools = [
  {
    type: "function",
    function: {
      name: "fetchAvailableSlots",
      description: "Fetch available time slots for booking",
      parameters: {
        type: "object",
        properties: {
          startDate: {
            type: "string",
            description: "Start date in ISO format (YYYY-MM-DD)",
          },
          endDate: {
            type: "string",
            description: "End date in ISO format (YYYY-MM-DD)",
          },
          duration: {
            type: "number",
            description: "Duration of the appointment in minutes",
          },
        },
        required: ["startDate", "endDate", "duration"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "createBooking",
      description: "Create a new booking",
      parameters: {
        type: "object",
        properties: {
          tenantId: {
            type: "string",
            description: "ID of the tenant",
          },
          vehicleId: {
            type: "string",
            description: "ID of the vehicle",
          },
          serviceType: {
            type: "string",
            description: "Type of service",
          },
          startTime: {
            type: "string",
            description: "Start time in ISO format",
          },
          endTime: {
            type: "string",
            description: "End time in ISO format",
          },
          notes: {
            type: "string",
            description: "Additional notes",
          },
          customerEmail: {
            type: "string",
            description: "Customer email",
          },
          customerName: {
            type: "string",
            description: "Customer name",
          },
          customerPhone: {
            type: "string",
            description: "Customer phone",
          },
        },
        required: ["tenantId", "vehicleId", "serviceType", "startTime", "endTime"],
      },
    },
  },
]

async function handler(req: NextRequest) {
  // Check if services are initialized
  if (!together || !convex) {
    throw new ConfigurationError("AI services not properly configured. Please check your environment variables.")
  }

  // Parse and validate request body
  const body = await req.json()
  const { messages, tenantId, vehicleId } = body

  // Validate required parameters
  if (!messages || !Array.isArray(messages)) {
    throw new ValidationError("Invalid messages format - must be an array")
  }

  if (!tenantId) {
    throw new ValidationError("Tenant ID is required")
  }

  // Create AI stream
  try {
    const result = await streamText({
      model: together.chat("Qwen/Qwen2-1.5B-Instruct"),
      messages,
      tools,
      toolChoice: "auto",
      onToolCall: async (toolCall) => {
        try {
          const { name, arguments: args } = toolCall.function

          if (name === "fetchAvailableSlots") {
            const parsedArgs = JSON.parse(args)

            // Validate tool arguments
            if (!parsedArgs.startDate || !parsedArgs.endDate || !parsedArgs.duration) {
              throw new ValidationError("Missing required parameters for fetchAvailableSlots")
            }

            const slots = await convex!.action(api.bookings.fetchAvailableSlots, {
              startDate: parsedArgs.startDate,
              endDate: parsedArgs.endDate,
              duration: parsedArgs.duration,
            })

            return { slots }
          }

          if (name === "createBooking") {
            const parsedArgs = JSON.parse(args)

            // Validate required parameters
            if (!parsedArgs.serviceType || !parsedArgs.startTime || !parsedArgs.endTime) {
              throw new ValidationError("Missing required parameters for createBooking")
            }

            const result = await convex!.mutation(api.bookings.create, {
              tenantId: tenantId || parsedArgs.tenantId,
              vehicleId: vehicleId || parsedArgs.vehicleId,
              serviceType: parsedArgs.serviceType,
              startTime: parsedArgs.startTime,
              endTime: parsedArgs.endTime,
              notes: parsedArgs.notes,
              customerEmail: parsedArgs.customerEmail,
              customerName: parsedArgs.customerName,
              customerPhone: parsedArgs.customerPhone,
            })

            return {
              success: true,
              bookingId: result.bookingId,
              googleEventId: result.googleEventId,
            }
          }

          throw new ValidationError(`Unknown tool: ${name}`)
        } catch (error) {
          console.error("Error in tool call:", error)

          if (error instanceof ValidationError) {
            return { error: error.message }
          }

          return {
            error: "Tool execution failed",
            details: process.env.NODE_ENV === "development" ? error : undefined,
          }
        }
      },
    })

    // Convert the result to a stream response
    return result.toDataStreamResponse()
  } catch (error) {
    throw new ExternalServiceError("Failed to process chat request", "Together AI", { originalError: error })
  }
}

// Export the handler with middleware
export const POST = withMiddleware(handler, withRateLimit, withErrorHandler)
