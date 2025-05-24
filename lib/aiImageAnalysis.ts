import { OpenAI } from "openai"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function analyzeImagesWithGPT4V(imageUrls: string[], formData: any) {
  try {
    // Prepare the system prompt
    const systemPrompt = `You are an expert vehicle damage assessor. 
Analyze the vehicle images and identify any damage, wear, or maintenance issues.
Compare your findings with the customer's self-assessment checklist.
Provide a detailed analysis with confidence scores.

Return your response as a JSON object with the following structure:
{
  "detectedIssues": [
    {
      "type": "damage|wear|modification|maintenance",
      "location": "specific location on vehicle",
      "description": "detailed description",
      "severity": 1-5 (where 1 is minor and 5 is severe),
      "confidence": 0.0-1.0,
      "matchesCustomerReport": true|false
    }
  ],
  "summary": "overall assessment summary",
  "missedIssues": ["list of issues customer didn't report but are visible"],
  "overreportedIssues": ["list of issues customer reported but aren't visible"]
}`

    // Extract customer-reported issues from form data
    const customerReportedIssues = formData.sections
      .flatMap((section: any) =>
        section.items
          .filter(
            (item: any) => (item.type === "checkbox" && item.value === true) || (item.type === "text" && item.value),
          )
          .map((item: any) => `${section.title} - ${item.label}: ${item.value}`),
      )
      .join("\n")

    // Prepare the user prompt
    const userPrompt = `Please analyze these vehicle images and identify any damage or issues.

Customer reported the following issues:
${customerReportedIssues || "No issues reported by customer"}

Please identify:
1. All visible damage or issues
2. Whether each issue matches what the customer reported
3. Any issues the customer missed
4. Any issues the customer reported that aren't visible`

    // Call OpenAI's GPT-4 Vision API
    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            ...imageUrls.map((url) => ({
              type: "image_url" as const,
              image_url: {
                url,
                detail: "high" as const,
              },
            })),
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    // Parse the AI response
    const aiResponseText = completion.choices[0]?.message?.content
    if (!aiResponseText) {
      throw new Error("No response from AI")
    }

    const aiAnalysis = JSON.parse(aiResponseText)

    // Format the response for our system
    return {
      detectedIssues: aiAnalysis.detectedIssues.map((issue: any) => ({
        type: issue.type,
        location: issue.location,
        severity: issue.severity,
        confidence: issue.confidence,
      })),
      summary: aiAnalysis.summary,
      missedIssues: aiAnalysis.missedIssues || [],
      overreportedIssues: aiAnalysis.overreportedIssues || [],
    }
  } catch (error) {
    console.error("Error analyzing images with GPT-4V:", error)
    throw error
  }
}
