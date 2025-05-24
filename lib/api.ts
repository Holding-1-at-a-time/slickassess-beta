import type { AIStreamObject } from "@/lib/types/ai-responses"

export async function analyzeVehicle(imageUrls: string[]): Promise<{
  summary: string
  detailedAnalysis: string[]
}> {
  const response = await fetch("/api/ai/analyze-vehicle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrls }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to analyze vehicle")
  }

  // Parse the streaming response
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let summary = ""
  const detailedAnalysis: string[] = []

  if (!reader) {
    throw new Error("No response body")
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split("\n")

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6)) as AIStreamObject

          if (data.type === "analysis" && data.data.summary) {
            summary = data.data.summary
          }

          if (data.type === "analysis" && data.data.recommendations) {
            detailedAnalysis.push(...data.data.recommendations)
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
  }

  return { summary, detailedAnalysis }
}
