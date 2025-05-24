export interface AIAnalysisItem {
  id: string
  type: "damage" | "wear" | "modification" | "maintenance"
  location: string
  description: string
  severity: "minor" | "moderate" | "severe"
  confidence: number
  estimatedCost?: {
    min: number
    max: number
    currency: string
  }
  suggestedAction?: string
}

export interface AIAnalysisStep {
  step: number
  status: "thinking" | "analyzing" | "complete"
  message: string
  items?: AIAnalysisItem[]
}

export interface AIAnalysisResult {
  vehicleType?: string
  overallCondition?: "excellent" | "good" | "fair" | "poor"
  analysisSteps: AIAnalysisStep[]
  detectedItems: AIAnalysisItem[]
  summary?: string
  recommendations?: string[]
  estimatedTotalCost?: {
    min: number
    max: number
    currency: string
  }
}

export interface AIAssessmentResponse {
  analysis: AIAnalysisResult
  metadata: {
    processingTime: number
    modelVersion: string
    confidence: number
  }
}

export interface AIStreamProgress {
  type: "progress"
  message: string
  percentComplete: number
}

export interface AIStreamThinking {
  type: "thinking"
  message: string
}

export interface AIStreamAnalysis {
  type: "analysis"
  step: AIAnalysisStep
}

export interface AIStreamComplete {
  type: "complete"
  result: AIAnalysisResult
}

export interface AIStreamError {
  type: "error"
  message: string
  code?: string
}

export type AIStreamObject = AIStreamProgress | AIStreamThinking | AIStreamAnalysis | AIStreamComplete | AIStreamError
