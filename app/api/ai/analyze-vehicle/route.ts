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

      // Prepare image analysis prompt
      const prompt = `
        Analyze these vehicle images and provide a detailed assessment.
        ${vehicleInfo ? `Vehicle info: ${JSON.stringify(vehicleInfo)}` : ""}
        Focus on identifying damage, wear and tear, and maintenance issues.
        For each issue, provide location, severity, and estimated repair cost.
      `

      // Emit progress update
      await emit({
        type: "progress",
        message: "Processing images with AI...",
        percentComplete: 20,
      })

      try {
        // Process first step - initial analysis
        const step1: AIAnalysisStep = {
          step: 1,
          status: "analyzing",
          message: "Identifying vehicle type and overall condition...",
        }
        await emit({ type: "analysis", step: step1 })

        // Simulate AI processing time (in production, this would be a real API call)
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Update step 1 with results
        step1.status = "complete"
        step1.message = "Vehicle type and condition identified."
        await emit({ type: "analysis", step: step1 })

        // Process second step - damage detection
        const step2: AIAnalysisStep = {
          step: 2,
          status: "analyzing",
          message: "Detecting damage and wear...",
        }
        await emit({ type: "analysis", step: step2 })

        // Simulate AI processing time
        await new Promise((resolve) => setTimeout(resolve, 3000))

        // In a real implementation, we would call OpenAI's API here
        // const response = await openai.chat.completions.create({
        //   model: "gpt-4-vision-preview",
        //   messages: [
        //     { role: "system", content: "You are a vehicle damage assessment expert." },
        //     { role: "user", content: [
        //       { type: "text", text: prompt },
        //       ...imageUrls.map(url => ({ type: "image_url", image_url: { url } }))
        //     ]}
        //   ],
        //   max_tokens: 1500,
        // })

        // For demo purposes, generate some sample items
        const detectedItems: AIAnalysisItem[] = [
          {
            id: "item1",
            type: "damage",
            location: "Front bumper",
            description: "Scratch and dent on the front bumper",
            severity: "moderate",
            confidence: 0.92,
            estimatedCost: {
              min: 300,
              max: 500,
              currency: "USD",
            },
            suggestedAction: "Repair and repaint",
          },
          {
            id: "item2",
            type: "wear",
            location: "Tires",
            description: "Significant tread wear on front tires",
            severity: "moderate",
            confidence: 0.88,
            estimatedCost: {
              min: 200,
              max: 400,
              currency: "USD",
            },
            suggestedAction: "Replace front tires",
          },
        ]

        // Update step 2 with results
        step2.status = "complete"
        step2.message = "Detected 2 issues."
        step2.items = detectedItems
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
          message: "Calculating cost estimates...",
        }
        await emit({ type: "analysis", step: step3 })

        // Simulate AI processing time
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Update step 3 with results
        step3.status = "complete"
        step3.message = "Cost estimates calculated."
        await emit({ type: "analysis", step: step3 })

        // Compile final result
        const result: AIAnalysisResult = {
          vehicleType: vehicleInfo?.type || "Sedan",
          overallCondition: "good",
          analysisSteps: [step1, step2, step3],
          detectedItems,
          summary: "Vehicle is in good condition with moderate damage to the front bumper and worn front tires.",
          recommendations: ["Repair and repaint front bumper", "Replace front tires", "Schedule regular maintenance"],
          estimatedTotalCost: {
            min: 500,
            max: 900,
            currency: "USD",
          },
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
      } catch (error) {
        console.error("Error in AI analysis:", error)
        await emit({
          type: "error",
          message: "Failed to analyze vehicle images",
          code: "ANALYSIS_FAILED",
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
