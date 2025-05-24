/**
 * Utility functions for image processing before sending to AI
 */

/**
 * Validates that an image URL is accessible and returns proper headers
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" })
    if (!response.ok) {
      return false
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.startsWith("image/")) {
      return false
    }

    return true
  } catch (error) {
    console.error("Error validating image URL:", error)
    return false
  }
}

/**
 * Validates multiple image URLs in parallel
 */
export async function validateImageUrls(urls: string[]): Promise<string[]> {
  const validationResults = await Promise.all(
    urls.map(async (url) => ({
      url,
      isValid: await validateImageUrl(url),
    })),
  )

  const validUrls = validationResults.filter((result) => result.isValid).map((result) => result.url)

  if (validUrls.length === 0) {
    throw new Error("No valid image URLs provided")
  }

  return validUrls
}

/**
 * Gets image dimensions from a URL without downloading the full image
 * (Note: This requires the image server to support partial content requests)
 */
export async function getImageDimensions(url: string): Promise<{ width: number; height: number } | null> {
  try {
    // For now, we'll return null as getting dimensions from URL
    // requires either downloading the image or having server support
    // In production, you might want to use a service that provides this
    return null
  } catch (error) {
    console.error("Error getting image dimensions:", error)
    return null
  }
}

/**
 * Estimates the cost of analyzing images based on their count and dimensions
 * This helps with cost management for API calls
 */
export function estimateAnalysisCost(imageCount: number): {
  estimatedTokens: number
  estimatedCost: number
} {
  // GPT-4 Vision pricing (as of knowledge cutoff):
  // ~$0.03 per 1K tokens for input
  // High detail images use ~765 tokens per image
  const tokensPerImage = 765
  const costPer1KTokens = 0.03

  const estimatedTokens = imageCount * tokensPerImage
  const estimatedCost = (estimatedTokens / 1000) * costPer1KTokens

  return {
    estimatedTokens,
    estimatedCost,
  }
}
