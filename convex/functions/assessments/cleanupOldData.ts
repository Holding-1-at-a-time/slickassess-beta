import { v } from "convex/values"
import { internalMutation } from "../_generated/server"

/**
 * Safely extracts a storage ID from an image URL
 * @param imageUrl The image URL to process
 * @returns The storage ID or null if invalid
 */
function extractStorageIdFromUrl(imageUrl: string): string | null {
  if (!imageUrl || typeof imageUrl !== "string") {
    return null
  }

  try {
    // Extract the storage ID using a regex pattern
    const match = imageUrl.match(/\/storage\/([a-zA-Z0-9]+)/)
    return match ? match[1] : null
  } catch (error) {
    console.error("Error extracting storage ID:", error)
    return null
  }
}

export const cleanupOldData = internalMutation({
  args: {
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const { imageUrl } = args

    // In the main function
    const storageId = extractStorageIdFromUrl(imageUrl)
    if (storageId) {
      await ctx.storage.delete(storageId)
    } else {
      console.warn(`Could not extract valid storage ID from URL: ${imageUrl}`)
    }
  },
})
