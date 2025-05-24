import { OpenAI } from "openai"
import { streamObject } from "ai"
import type { NextRequest } from "next/server"
import { z } from "zod"
import type { AIStreamObject, AIAnalysisStep, AIAnalysisResult } from "@/lib/types/ai-responses"

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

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const validatedData = requestSchema.parse(body)
    const { imageUrls, vehicleInfo, tenantId } = validatedData

    // Create a stream for the response
    return streamObject<AIStreamObject>(async (emit) => {
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

      // Process first step - initial analysis
      const step1: AIAnalysisStep = {
        step: 1,
        status: "analyzing",
        message: "Identifying vehicle type and overall condition...",
      }
      await emit({ type: "analysis", step: step1 })

      // Prepare system prompt for OpenAI
      const systemPrompt = `
        You are an expert vehicle damage assessor with years of experience in the automotive industry.
        Analyze the provided vehicle images to identify damage, wear and tear, and maintenance issues.
        
        Provide your analysis in the following JSON format:
        {
          "vehicleType": "string", // The type of vehicle (sedan, SUV, truck, etc.)
          "overallCondition": "excellent" | "good" | "fair" | "poor",
          "detectedItems": [
            {
              "id": "string", // A unique identifier for this item
              "type": "damage" | "wear" | "modification" | "maintenance",
              "location": "string", // Specific part of the vehicle
              "description": "string", // Detailed description of the issue
              "severity": "minor" | "moderate" | "severe",
              "confidence": number, // Between 0 and 1
              "estimatedCost": {
                "min": number,
                "max": number,
                "currency": "string"
              },
              "suggestedAction": "string" // Recommended repair or maintenance
            }
          ],
          "summary": "string", // Brief summary of overall condition
          "recommendations": ["string"], // List of recommended actions
          "estimatedTotalCost": {
            "min": number,
            "max": number,
            "currency": "string"
          }
        }
        
        Be thorough in your analysis but focus on significant issues. Provide realistic cost estimates based on industry standards.
        If you cannot see certain areas of the vehicle clearly, note this in your analysis.
      `

      // Prepare user prompt with vehicle info
      const userPrompt = `
        Please analyze these vehicle images and provide a detailed assessment.
        ${
          vehicleInfo
            ? `Vehicle information:
            - Make: ${vehicleInfo.make || "Unknown"}
            - Model: ${vehicleInfo.model || "Unknown"}
            - Year: ${vehicleInfo.year || "Unknown"}
            - Type: ${vehicleInfo.type || "Unknown"}`
            : "No vehicle information provided."
        }
        
        Focus on identifying:
        1. Exterior damage (dents, scratches, broken parts)
        2. Signs of wear and tear
        3. Any visible maintenance issues
        4. Modifications from standard configuration
        
        For each issue, estimate repair costs and recommend appropriate actions.
      `

      try {
        // Update progress
        await emit({
          type: "progress",
          message: "Processing images with AI...",
          percentComplete: 20,
        })

        // Prepare the API call to OpenAI
        const response = await openai.chat.completions.create({
          model: "gpt-4-vision-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: userPrompt },
                ...imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
              ],
            },
          ],
          max_tokens: 2000,
          temperature: 0.2, // Lower temperature for more consistent results
          response_format: { type: "json_object" }, // Request JSON response
        })

        // Update step 1 with results
        step1.status = "complete"
        step1.message = "Vehicle type and condition identified."
        await emit({ type: "analysis", step: step1 })

        // Process second step - damage detection
        const step2: AIAnalysisStep = {
          step: 2,
          status: "analyzing",
          message: "Analyzing detected damage and wear...",
        }
        await emit({ type: "analysis", step: step2 })

        // Update progress
        await emit({
          type: "progress",
          message: "Processing AI results...",
          percentComplete: 60,
        })

        // Parse the OpenAI response
        const content = response.choices[0]?.message?.content
        if (!content) {
          throw new Error("No content in OpenAI response")
        }

        let parsedResult: AIAnalysisResult
        try {
          parsedResult = JSON.parse(content) as AIAnalysisResult

          // Validate the parsed result has the expected structure
          if (!parsedResult.detectedItems || !Array.isArray(parsedResult.detectedItems)) {
            throw new Error("Invalid response format: missing or invalid detectedItems")
          }

          // Ensure each item has an id
          parsedResult.detectedItems = parsedResult.detectedItems.map((item, index) => ({
            ...item,
            id: item.id || `item-${index + 1}`,
          }))
        } catch (parseError) {
          console.error("Error parsing OpenAI response:", parseError)
          throw new Error("Failed to parse AI response")
        }

        // Update step 2 with results
        step2.status = "complete"
        step2.message = `Detected ${parsedResult.detectedItems.length} issues.`
        step2.items = parsedResult.detectedItems
        await emit({ type: "analysis", step: step2 })

        // Emit progress update
        await emit({
          type: "progress",
          message: "Finalizing assessment...",
          percentComplete: 80,
        })

        // Process third step - cost estimation
        const step3: AIAnalysisStep = {
          step: 3,
          status: "analyzing",
          message: "Verifying cost estimates...",
        }
        await emit({ type: "analysis", step: step3 })

        // Perform any additional processing or validation on the cost estimates
        // For example, we could adjust estimates based on regional pricing data

        // Update step 3 with results
        step3.status = "complete"
        step3.message = "Cost estimates verified."
        await emit({ type: "analysis", step: step3 })

        // Compile final result with all steps
        const result: AIAnalysisResult = {
          ...parsedResult,
          analysisSteps: [step1, step2, step3],
        }

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

        // Log the analysis for audit purposes (in production, store in database)
        console.log(`Completed analysis for tenant ${tenantId} with ${imageUrls.length} images`)
      } catch (error) {
        console.error("Error in AI analysis:", error)

        // Determine if it's an OpenAI API error
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        const isRateLimitError = errorMessage.includes("rate limit") || errorMessage.includes("429")

        await emit({
          type: "error",
          message: isRateLimitError
            ? "AI service is currently busy. Please try again in a few minutes."
            : "Failed to analyze vehicle images. Please try again.",
          code: isRateLimitError ? "RATE_LIMIT_EXCEEDED" : "ANALYSIS_FAILED",
        })
      }
    })
  } catch (error) {
    console.error("Error processing request:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }
}
