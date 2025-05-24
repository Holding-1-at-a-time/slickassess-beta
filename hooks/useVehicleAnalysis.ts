"use client"

import { useState, useCallback } from "react"
import { analyzeVehicle } from "@/lib/api"
import { generateFallbackAnalysis } from "@/lib/aiAnalysisRecovery"

interface AnalysisResult {
  summary: string
  detailedAnalysis: string[]
}

const useVehicleAnalysis = (imageUrls: string[]) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startAnalysis = useCallback(async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const analysisResult = await analyzeVehicle(imageUrls)
      setResult(analysisResult)
    } catch (error) {
      console.error("Failed to analyze vehicle:", error)
      setIsAnalyzing(false)

      // Provide a fallback analysis if AI fails
      const fallbackResult = generateFallbackAnalysis(imageUrls.length)
      setResult(fallbackResult)

      // Update error message based on error type
      let errorMessage = "Failed to analyze vehicle"
      if (error instanceof Error) {
        if (error.message.includes("Rate limit")) {
          errorMessage = "Too many requests. Please try again in a few minutes."
        } else if (error.message.includes("Authentication")) {
          errorMessage = "Service configuration error. Please contact support."
        }
      }
      setError(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }, [imageUrls])

  return { isAnalyzing, result, error, startAnalysis }
}

export default useVehicleAnalysis
