import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Get the last user message
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()

    // Simple fallback response
    const responseText = `I understand you said: "${lastUserMessage?.content}". Currently, our booking system is being set up. Please try again later or contact us directly for assistance.`

    return NextResponse.json({
      id: "fallback-response",
      role: "assistant",
      content: responseText,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error("Error in fallback chat handler:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}
