import { NextResponse } from "next/server"
import OpenAI from "openai"
import { validateEnvVar } from "@/lib/env-validator"

export const runtime = "nodejs"
export const maxDuration = 60 // Set maximum execution time to 60 seconds

export async function POST(request: Request) {
  // Validate OpenAI API key
  const apiKey = validateEnvVar("OPENAI_API_KEY", {
    required: true,
    pattern: /^sk-[a-zA-Z0-9]{32,}$/,
    errorMessage: "Invalid OpenAI API key format",
  })

  const openai = new OpenAI({
    apiKey,
  })

  try {
    const { images, vehicleInfo } = await request.json()

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "At least one image is required" }, { status: 400 })
    }

    // Prepare the messages for the OpenAI API
    const messages = [
      {
        role: "system",
        content: `You are a vehicle damage assessment expert. Analyze the provided images of a vehicle and identify any visible damage. 
        Return your analysis as a JSON object with the following structure:
        {
          "damageDetected": boolean,
          "damageAreas": ["front", "rear", "driver_side", "passenger_side", "roof", "undercarriage", "interior"],
          "damageSeverity": "none" | "minor" | "moderate" | "severe",
          "damageDescription": "Detailed description of the damage",
          "repairRecommendations": ["List of recommended repairs"],
          "estimatedRepairCost": { "min": number, "max": number },
          "damageTagsAI": ["dent", "scratch", "broken_glass", "missing_part", "fluid_leak", "alignment_issue"]
        }
        Only include damage areas and tags that are actually visible in the images.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Please analyze these images of a ${vehicleInfo?.year || ""} ${vehicleInfo?.make || ""} ${vehicleInfo?.model || ""} and provide a damage assessment.`,
          },
          ...images.map((image: string) => ({
            type: "image_url",
            image_url: { url: image },
          })),
        ],
      },
    ]

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: messages as any,
      max_tokens: 1500,
    })

    const aiResponse = response.choices[0]?.message?.content || ""

    // Parse the JSON response
    let parsedResponse
    try {
      // Attempt to parse the JSON response
      parsedResponse = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Raw AI response:", aiResponse)

      // Return a specific error about the parsing issue
      return NextResponse.json(
        {
          error: "Failed to parse AI analysis response",
          details: "The AI returned malformed JSON",
          rawResponse: aiResponse.substring(0, 500) + "...", // Include part of the raw response for debugging
        },
        { status: 500 },
      )
    }

    return NextResponse.json(parsedResponse)
  } catch (error: any) {
    console.error("Error analyzing vehicle:", error)
    return NextResponse.json({ error: error.message || "Failed to analyze vehicle" }, { status: 500 })
  }
}
