import { OpenAI } from "openai"

// Define the types for our AI analysis
interface DetectedIssue {
  type: string
  location: string
  severity: number // 1-5 scale
  confidence: number // 0-1 scale
}

interface AIAnalysisResult {
  detectedIssues: DetectedIssue[]
  summary: string
}

interface FormData {
  sections: Array<{
    id: string
    title: string
    items: Array<{
      id: string
      type: string
      label: string
      value?: any
      options?: string[]
    }>
  }>
}

/**
 * Analyzes vehicle images using GPT-4V to detect damage and issues
 * @param imageUrls Array of image URLs to analyze
 * @param formData The form data submitted by the user
 * @returns Promise resolving to an AIAnalysisResult
 */
export async function analyzeImagesWithGPT4V(imageUrls: string[], formData: FormData): Promise<AIAnalysisResult> {
  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  // Extract user-reported issues from form data
  const userReportedIssues = extractUserReportedIssues(formData)

  // Prepare the prompt for GPT-4V
  const prompt = `
    You are an expert vehicle damage assessor. Analyze these vehicle images and identify any damage or issues.
    
    User has reported the following issues:
    ${
      userReportedIssues.length > 0
        ? userReportedIssues.map((issue) => `- ${issue}`).join("\n")
        : "No issues reported by user"
    }
    
    For each issue you detect:
    1. Identify the type (scratch, dent, crack, stain, tear, etc.)
    2. Specify the location (front bumper, driver door, passenger seat, etc.)
    3. Rate severity on a scale of 1-5 (1 = minor, 5 = severe)
    4. Indicate your confidence in the detection (0.0-1.0)
    
    Also provide a brief summary of the overall condition.
    
    Format your response as a JSON object with this structure:
    {
      "detectedIssues": [
        {
          "type": "string",
          "location": "string",
          "severity": number,
          "confidence": number
        }
      ],
      "summary": "string"
    }
  `

  try {
    // Create an array of image URLs for the API call
    const images = imageUrls.map((url) => ({ type: "url", url }))

    // Call GPT-4V API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...images.map((image) => ({ type: "image_url", image_url: image })),
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: "json_object" },
    })

    // Parse the response
    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No content in GPT-4V response")
    }

    const result = JSON.parse(content) as AIAnalysisResult

    // Validate the result structure
    if (!result.detectedIssues || !Array.isArray(result.detectedIssues) || !result.summary) {
      throw new Error("Invalid response format from GPT-4V")
    }

    return result
  } catch (error) {
    console.error("Error analyzing images with GPT-4V:", error)

    // Return a fallback result if the API call fails
    return {
      detectedIssues: [],
      summary: "Failed to analyze images. Please have a technician review the assessment manually.",
    }
  }
}

/**
 * Extracts user-reported issues from form data
 * @param formData The form data submitted by the user
 * @returns Array of issue descriptions
 */
function extractUserReportedIssues(formData: FormData): string[] {
  const issues: string[] = []

  // Iterate through form sections and items
  for (const section of formData.sections) {
    for (const item of section.items) {
      // For checkboxes that are checked
      if (item.type === "checkbox" && item.value === true) {
        issues.push(item.label)
      }

      // For text fields with content
      if (item.type === "text" && item.value && typeof item.value === "string" && item.value.trim() !== "") {
        issues.push(`${item.label}: ${item.value}`)
      }

      // For select fields with a selection
      if (item.type === "select" && item.value) {
        issues.push(`${item.label}: ${item.value}`)
      }
    }
  }

  return issues
}
