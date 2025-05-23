import { streamText } from "ai"
import { Together } from "together-ai"
import { fetchAvailableSlots } from "@/convex/functions/fetchAvailableSlots"
import { createBooking } from "@/convex/functions/createBooking"

// Initialize the Together AI client with validation
const apiKey = process.env.TOGETHER_API_KEY
const together = apiKey ? new Together({ apiKey }) : null

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

export async function POST(req: Request) {
  try {
    // Check if Together AI client is initialized
    if (!together) {
      console.error("Together AI client not initialized - missing API key")
      return Response.redirect(new URL("/api/chat/fallback", req.url), 307)
    }

    // Extract the messages from the request
    const { messages, tenantId, vehicleId } = await req.json()

    // Validate required parameters
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create a stream using the new AI SDK 4.0 syntax
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
              try {
                const parsedArgs = JSON.parse(args)
                const slots = await fetchAvailableSlots({
                  startDate: parsedArgs.startDate,
                  endDate: parsedArgs.endDate,
                  duration: parsedArgs.duration,
                })
                return { slots }
              } catch (error) {
                console.error("Error fetching available slots:", error)
                return {
                  error: "Failed to fetch available slots",
                  slots: [],
                }
              }
            }

            if (name === "createBooking") {
              try {
                const parsedArgs = JSON.parse(args)

                // Validate required parameters
                if (!tenantId && !parsedArgs.tenantId) {
                  return { error: "Missing tenantId parameter" }
                }

                if (!vehicleId && !parsedArgs.vehicleId) {
                  return { error: "Missing vehicleId parameter" }
                }

                const result = await createBooking({
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
              } catch (error) {
                console.error("Error creating booking:", error)
                return {
                  error: "Failed to create booking",
                  details: error instanceof Error ? error.message : "Unknown error",
                }
              }
            }

            return { error: `Unknown tool: ${name}` }
          } catch (error) {
            console.error("Error in tool call:", error)
            return { error: "Tool call failed" }
          }
        },
      })

      // Convert the result to a stream response
      return result.toDataStreamResponse()
    } catch (error) {
      console.error("Error in AI stream:", error)
      return Response.redirect(new URL("/api/chat/fallback", req.url), 307)
    }
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
