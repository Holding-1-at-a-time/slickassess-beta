"use client"

import { useState } from "react"
import { VehicleAnalysisViewer } from "@/components/VehicleAnalysisViewer"
import type { AIAnalysisResult } from "@/lib/types/ai-responses"

interface AIAnalysisPageProps {
  params: {
    tenantId: string
  }
}

export default function AIAnalysisPage({ params }: AIAnalysisPageProps) {
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)

  const handleAnalysisComplete = (result: AIAnalysisResult) => {
    setAnalysisResult(result)
    // Here you could save the result to your database or perform other actions
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">AI Vehicle Analysis</h1>

      <VehicleAnalysisViewer tenantId={params.tenantId} onAnalysisComplete={handleAnalysisComplete} />
    </div>
  )
}
