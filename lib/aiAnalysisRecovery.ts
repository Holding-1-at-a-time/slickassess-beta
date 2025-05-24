import type { AIAnalysisResult, AIAnalysisItem } from "@/lib/types/ai-responses"

/**
 * Provides fallback analysis when AI analysis fails
 * This ensures users still get some value even if the AI is unavailable
 */
export function generateFallbackAnalysis(imageCount: number): AIAnalysisResult {
  const fallbackItems: AIAnalysisItem[] = [
    {
      id: "fallback-1",
      type: "maintenance",
      location: "General",
      description: "AI analysis unavailable - manual inspection recommended",
      severity: "minor",
      confidence: 0.5,
      suggestedAction: "Schedule a professional inspection for accurate assessment",
    },
  ]

  return {
    vehicleType: "Unknown",
    overallCondition: "fair",
    analysisSteps: [
      {
        step: 1,
        status: "complete",
        message: "Fallback analysis used due to AI unavailability",
      },
    ],
    detectedItems: fallbackItems,
    summary: `Unable to perform AI analysis on ${imageCount} image${
      imageCount !== 1 ? "s" : ""
    }. Please have a technician review the images for accurate assessment.`,
    recommendations: [
      "Schedule an in-person inspection",
      "Ensure all images are clear and well-lit",
      "Try the AI analysis again later",
    ],
    estimatedTotalCost: {
      min: 0,
      max: 0,
      currency: "USD",
    },
  }
}

/**
 * Attempts to extract partial results from incomplete AI responses
 */
export function extractPartialResults(partialResponse: any): Partial<AIAnalysisResult> | null {
  try {
    const result: Partial<AIAnalysisResult> = {}

    if (partialResponse?.vehicleType) {
      result.vehicleType = partialResponse.vehicleType
    }

    if (partialResponse?.overallCondition) {
      result.overallCondition = partialResponse.overallCondition
    }

    if (Array.isArray(partialResponse?.detectedIssues)) {
      result.detectedItems = partialResponse.detectedIssues
        .filter((issue: any) => issue?.type && issue?.location)
        .map((issue: any, index: number) => ({
          id: `partial-${index + 1}`,
          type: issue.type,
          location: issue.location,
          description: issue.description || "Description unavailable",
          severity: issue.severity || "minor",
          confidence: issue.confidence || 0.5,
          estimatedCost: issue.estimatedCost,
          suggestedAction: issue.suggestedAction,
        }))
    }

    if (partialResponse?.summary) {
      result.summary = partialResponse.summary
    }

    return Object.keys(result).length > 0 ? result : null
  } catch (error) {
    console.error("Error extracting partial results:", error)
    return null
  }
}

/**
 * Validates and sanitizes AI analysis results
 */
export function validateAnalysisResult(result: AIAnalysisResult): AIAnalysisResult {
  // Ensure all cost estimates are non-negative
  if (result.estimatedTotalCost) {
    result.estimatedTotalCost.min = Math.max(0, result.estimatedTotalCost.min)
    result.estimatedTotalCost.max = Math.max(result.estimatedTotalCost.min, result.estimatedTotalCost.max)
  }

  // Ensure all items have valid confidence scores
  result.detectedItems = result.detectedItems.map((item) => ({
    ...item,
    confidence: Math.min(1, Math.max(0, item.confidence)),
  }))

  // Sort items by severity (severe first)
  const severityOrder = { severe: 0, moderate: 1, minor: 2 }
  result.detectedItems.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return result
}
