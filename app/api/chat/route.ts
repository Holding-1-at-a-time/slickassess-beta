import { StreamingTextResponse } from "ai"
import { Together } from "together-ai"
import { fetchAvailableSlots } from "@/convex/functions/fetchAvailableSlots"
import { createBooking } from "@/convex/functions/createBooking"

// Initialize the Together AI client
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
})

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
  // Extract the messages from the request
  const { messages, tenantId, vehicleId } = await req.json()

  // Create a response stream
  const response = await together.chat.completions.create({
    model: "Qwen/Qwen2-1.5B-Instruct",
    messages,
    tools,
    tool_choice: "auto",
    stream: true,
  })

  // Process tool calls
  const processToolCall = async (toolCall: any) => {
    const { name, arguments: args } = toolCall.function

    if (name === "fetchAvailableSlots") {
      const parsedArgs = JSON.parse(args)
      const slots = await fetchAvailableSlots({
        startDate: parsedArgs.startDate,
        endDate: parsedArgs.endDate,
        duration: parsedArgs.duration,
      })

      return { slots }
    }

    if (name === "createBooking") {
      const parsedArgs = JSON.parse(args)
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

      return { bookingId: result.bookingId, googleEventId: result.googleEventId }
    }

    return { error: `Unknown tool: ${name}` }
  }

  // Convert the response to a streaming response
  const stream = Together.toReadableStream(response)

  return new StreamingTextResponse(stream)
}
