"use client"

import { useState } from "react"
import { useObjectStream } from "ai/react"
import type { AIStreamObject, AIAnalysisResult } from "@/lib/types/ai-responses"

interface UseVehicleAnalysisProps {
  tenantId: string
  onComplete?: (result: AIAnalysisResult) => void
  onError?: (error: Error) => void
}

export function useVehicleAnalysis({ tenantId, onComplete, onError }: UseVehicleAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const { objects, error, isLoading, append } = useObjectStream<AIStreamObject>({
    api: "/api/ai/analyze-vehicle",
    onFinish: (objects) => {
      setIsAnalyzing(false)
      const completeObject = objects.find((obj) => obj.type === "complete") as
        | { type: "complete"; result: AIAnalysisResult }
        | undefined
      if (completeObject) {
        onComplete?.(completeObject.result)
      }
    },
    onError: (err) => {
      setIsAnalyzing(false)
      onError?.(err)
    },
  })

  const analyzeVehicle = async (
    imageUrls: string[],
    vehicleInfo?: {
      make?: string
      model?: string
      year?: number
      type?: string
    },
  ) => {
    setIsAnalyzing(true)
    await append({
      imageUrls,
      vehicleInfo,
      tenantId,
    })
  }

  // Extract different types of objects from the stream
  const progressUpdates = objects.filter((obj) => obj.type === "progress") as Array<{
    type: "progress"
    message: string
    percentComplete: number
  }>
  const thinkingSteps = objects.filter((obj) => obj.type === "thinking") as Array<{ type: "thinking"; message: string }>
  const analysisSteps = objects.filter((obj) => obj.type === "analysis") as Array<{ type: "analysis"; step: any }>
  const completeResult = objects.find((obj) => obj.type === "complete") as
    | { type: "complete"; result: AIAnalysisResult }
    | undefined
  const streamError = objects.find((obj) => obj.type === "error") as
    | { type: "error"; message: string; code?: string }
    | undefined

  // Calculate current progress
  const currentProgress = progressUpdates.length > 0 ? progressUpdates[progressUpdates.length - 1].percentComplete : 0

  // Get the latest message to display
  const latestMessage =
    progressUpdates.length > 0
      ? progressUpdates[progressUpdates.length - 1].message
      : thinkingSteps.length > 0
        ? thinkingSteps[thinkingSteps.length - 1].message
        : analysisSteps.length > 0
          ? analysisSteps[analysisSteps.length - 1].step.message
          : streamError
            ? streamError.message
            : "Ready to analyze"

  return {
    analyzeVehicle,
    isAnalyzing: isLoading || isAnalyzing,
    progress: currentProgress,
    message: latestMessage,
    progressUpdates,
    thinkingSteps,
    analysisSteps,
    result: completeResult?.result,
    error: error || streamError?.message,
    objects,
  }
}
