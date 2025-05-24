import { OpenAI } from "openai"
import { streamObject } from "ai"
import type { NextRequest } from "next/server"
import { z } from "zod"
import type { AIStreamObject, AIAnalysisItem, AIAnalysisStep, AIAnalysisResult } from "@/lib/types/ai-responses"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Input validation schema
const requestSchema = z.object({
  imageUrls: z.array(z.string().url()).min(1).max(5),
  vehicleInfo: z
    .object({
      make: z.string().optional(),
      model: z.string().optional(),
      year: z.number().optional(),
      type: z.string().optional(),
    })
    .optional(),
  tenantId: z.string(),
})

// Schema for OpenAI response validation
const aiResponseSchema = z.object({
  vehicleType: z.string(),
  overallCondition: z.enum(["excellent", "good", "fair", "poor"]),
  detectedIssues: z.array(
    z.object({
      type: z.enum(["damage", "wear", "modification", "maintenance"]),
      location: z.string(),
      description: z.string(),
      severity: z.enum(["minor", "moderate", "severe"]),
      confidence: z.number().min(0).max(1),
      estimatedCost: z
        .object({
          min: z.number(),
          max: z.number(),
          currency: z.string(),
        })
        .optional(),
      suggestedAction: z.string().optional(),
    }),
  ),
  summary: z.string(),
  recommendations: z.array(z.string()),
  totalEstimatedCost: z.object({
    min: z.number(),
    max: z.number(),
    currency: z.string(),
  }),
})

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const validatedData = requestSchema.parse(body)
    const { imageUrls, vehicleInfo, tenantId } = validatedData

    // Create a stream for the response
    return streamObject<AIStreamObject>(async (emit) => {
      try {
        // Emit initial progress
        await emit({
          type: "progress",
          message: "Starting analysis...",
          percentComplete: 5,
        })

        // Emit thinking state
        await emit({
          type: "thinking",
          message: "Examining vehicle images...",
        })

        // Step 1: Vehicle identification
        const step1: AIAnalysisStep = {
          step: 1,
          status: "analyzing",
          message: "Identifying vehicle type and overall condition...",
        }
        await emit({ type: "analysis", step: step1 })

        // Prepare the system prompt
        const systemPrompt = `You are an expert vehicle damage assessor and automotive technician. 
Your task is to analyze vehicle images and provide a detailed assessment of any damage, wear, or maintenance issues.

Guidelines:
1. Be specific about locations (e.g., "driver-side front bumper" not just "bumper")
2. Provide realistic cost estimates in USD based on average repair costs
3. Rate severity as minor (cosmetic only), moderate (affects function but drivable), or severe (safety concern or major repair needed)
4. Include confidence scores from 0.0 to 1.0 for each detected issue
5. Suggest appropriate actions for each issue

Respond with a JSON object following this exact structure:
{
  "vehicleType": "string (e.g., Sedan, SUV, Truck)",
  "overallCondition": "excellent | good | fair | poor",
  "detectedIssues": [
    {
      "type": "damage | wear | modification | maintenance",
      "location": "specific location on vehicle",
      "description": "detailed description of the issue",
      "severity": "minor | moderate | severe",
      "confidence": 0.0-1.0,
      "estimatedCost": {
        "min": number,
        "max": number,
        "currency": "USD"
      },
      "suggestedAction": "recommended repair or action"
    }
  ],
  "summary": "overall assessment summary",
  "recommendations": ["list of recommended actions in priority order"],
  "totalEstimatedCost": {
    "min": total minimum cost,
    "max": total maximum cost,
    "currency": "USD"
  }
}`

        // Prepare the user prompt
        const userPrompt = `Please analyze these vehicle images and provide a comprehensive damage assessment.
${
  vehicleInfo
    ? `Vehicle Information:
- Make: ${vehicleInfo.make || "Unknown"}
- Model: ${vehicleInfo.model || "Unknown"}
- Year: ${vehicleInfo.year || "Unknown"}
- Type: ${vehicleInfo.type || "Unknown"}`
    : ""
}

Focus on:
1. Body damage (dents, scratches, rust)
2. Glass damage (cracks, chips)
3. Tire condition
4. Visible mechanical issues
5. Interior damage (if visible)
6. Paint condition
7. Any modifications from stock condition`

        // Emit progress update
        await emit({
          type: "progress",
          message: "Analyzing images with AI...",
          percentComplete: 20,
        })

        // Call OpenAI's GPT-4 Vision API
        const completion = await openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: userPrompt,
                },
                ...imageUrls.map((url) => ({
                  type: "image_url" as const,
                  image_url: {
                    url,
                    detail: "high" as const,
                  },
                })),
              ],
            },
          ],
          max_tokens: 2000,
          temperature: 0.3, // Lower temperature for more consistent results
          response_format: { type: "json_object" },
        })

        // Update step 1 as complete
        step1.status = "complete"
        step1.message = "Vehicle identification complete."
        await emit({ type: "analysis", step: step1 })

        // Emit progress update
        await emit({
          type: "progress",
          message: "Processing AI response...",
          percentComplete: 60,
        })

        // Step 2: Parse and validate AI response
        const step2: AIAnalysisStep = {
          step: 2,
          status: "analyzing",
          message: "Processing damage assessment...",
        }
        await emit({ type: "analysis", step: step2 })

        // Parse the AI response
        const aiResponseText = completion.choices[0]?.message?.content
        if (!aiResponseText) {
          throw new Error("No response from AI")
        }

        let parsedResponse
        try {
          parsedResponse = JSON.parse(aiResponseText)
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError)
          throw new Error("Invalid response format from AI")
        }

        // Validate the AI response
        const validatedResponse = aiResponseSchema.parse(parsedResponse)

        // Convert detected issues to our format with IDs
        const detectedItems: AIAnalysisItem[] = validatedResponse.detectedIssues.map((issue, index) => ({
          id: `issue-${index + 1}`,
          ...issue,
        }))

        // Update step 2 with results
        step2.status = "complete"
        step2.message = `Detected ${detectedItems.length} issue${detectedItems.length !== 1 ? "s" : ""}.`
        step2.items = detectedItems
        await emit({ type: "analysis", step: step2 })

        // Emit progress update
        await emit({
          type: "progress",
          message: "Calculating final estimates...",
          percentComplete: 80,
        })

        // Step 3: Finalize assessment
        const step3: AIAnalysisStep = {
          step: 3,
          status: "analyzing",
          message: "Finalizing assessment and recommendations...",
        }
        await emit({ type: "analysis", step: step3 })

        // Create the final result
        const result: AIAnalysisResult = {
          vehicleType: validatedResponse.vehicleType,
          overallCondition: validatedResponse.overallCondition,
          analysisSteps: [step1, step2, step3],
          detectedItems,
          summary: validatedResponse.summary,
          recommendations: validatedResponse.recommendations,
          estimatedTotalCost: validatedResponse.totalEstimatedCost,
        }

        // Update step 3 as complete
        step3.status = "complete"
        step3.message = "Assessment complete."
        await emit({ type: "analysis", step: step3 })

        // Emit final progress
        await emit({
          type: "progress",
          message: "Analysis complete",
          percentComplete: 100,
        })

        // Emit complete result
        await emit({
          type: "complete",
          result,
        })

        // Log successful analysis for monitoring
        console.log(`Vehicle analysis completed for tenant ${tenantId}:`, {
          vehicleType: result.vehicleType,
          condition: result.overallCondition,
          issueCount: detectedItems.length,
          totalCost: result.estimatedTotalCost,
        })
      } catch (error) {
        console.error("Error in AI analysis:", error)

        // Determine error type and message
        let errorMessage = "Failed to analyze vehicle images"
        let errorCode = "ANALYSIS_FAILED"

        if (error instanceof z.ZodError) {
          errorMessage = "AI response format was invalid. Please try again."
          errorCode = "INVALID_AI_RESPONSE"
        } else if (error instanceof OpenAI.APIError) {
          if (error.status === 429) {
            errorMessage = "Rate limit exceeded. Please try again in a moment."
            errorCode = "RATE_LIMIT"
          } else if (error.status === 401) {
            errorMessage = "Authentication failed. Please check API configuration."
            errorCode = "AUTH_FAILED"
          } else {
            errorMessage = `OpenAI API error: ${error.message}`
            errorCode = "OPENAI_ERROR"
          }
        }

        await emit({
          type: "error",
          message: errorMessage,
          code: errorCode,
        })
      }
    })
  } catch (error) {
    console.error("Error processing request:", error)

    let errorMessage = "Failed to process request"
    if (error instanceof z.ZodError) {
      errorMessage = "Invalid request data: " + error.errors.map((e) => e.message).join(", ")
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
}
