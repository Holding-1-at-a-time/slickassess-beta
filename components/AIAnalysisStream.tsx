"use client"

import { useEffect, useState } from "react"
import { usePersistentStream } from "@/hooks/usePersistentStream"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIAnalysisStreamProps {
  assessmentId: string
  images: string[]
  tenantId: string
  onComplete?: (analysis: any) => void
}

export function AIAnalysisStream({ assessmentId, images, tenantId, onComplete }: AIAnalysisStreamProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const { stream, isStreaming, startStream, appendContent, content, status } = usePersistentStream({
    sessionId: assessmentId,
    tenantId,
    type: "assessment_analysis",
    onComplete: (content) => {
      try {
        const parsed = JSON.parse(content)
        setAnalysis(parsed)
        onComplete?.(parsed)
      } catch (error) {
        console.error("Failed to parse analysis:", error)
      }
    },
  })

  useEffect(() => {
    if (images.length > 0 && !stream) {
      performAnalysis()
    }
  }, [images])

  const performAnalysis = async () => {
    try {
      const streamId = await startStream({ images, assessmentId })

      // Simulate AI analysis with streaming
      const response = await fetch("/api/ai/analyze-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, streamId }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete JSON objects from the buffer
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line)
              if (data.content) {
                await appendContent(data.content, data.isComplete)
              }
            } catch (e) {
              console.error("Failed to parse stream data:", e)
            }
          }
        }
      }
    } catch (error) {
      console.error("Analysis error:", error)
    }
  }

  return (
    <Card className={cn("w-full", isStreaming && "animate-pulse")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          AI Analysis
          {isStreaming && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status === "pending" && <p className="text-muted-foreground">Preparing analysis...</p>}

        {status === "streaming" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Analyzing images...</p>
            <div className="bg-muted p-4 rounded-md">
              <pre className="whitespace-pre-wrap text-sm">{content}</pre>
            </div>
          </div>
        )}

        {status === "completed" && analysis && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Detected Issues</h4>
              <ul className="space-y-2">
                {analysis.detectedIssues?.map((issue: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span
                      className={cn(
                        "inline-block w-2 h-2 rounded-full mt-1.5",
                        issue.severity === "high" && "bg-red-500",
                        issue.severity === "medium" && "bg-yellow-500",
                        issue.severity === "low" && "bg-green-500",
                      )}
                    />
                    <div>
                      <p className="font-medium">{issue.description}</p>
                      <p className="text-sm text-muted-foreground">Confidence: {Math.round(issue.confidence * 100)}%</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {analysis.estimatedCost && (
              <div>
                <h4 className="font-semibold mb-2">Estimated Cost</h4>
                <p className="text-2xl font-bold">${analysis.estimatedCost.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}

        {status === "failed" && <p className="text-destructive">Analysis failed. Please try again.</p>}
      </CardContent>
    </Card>
  )
}
