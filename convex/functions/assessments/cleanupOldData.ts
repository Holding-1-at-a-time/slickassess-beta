import { internalAction } from "../../_generated/server"
import { v } from "convex/values"

export default internalAction({
  args: {
    tenantId: v.string(),
    olderThan: v.optional(v.number()), // Timestamp in milliseconds (default: 1 year)
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      // Default to 1 year if not specified
      const cutoffDate = args.olderThan || Date.now() - 365 * 24 * 60 * 60 * 1000
      const dryRun = args.dryRun !== undefined ? args.dryRun : true

      // Get old assessments
      const oldAssessments = await ctx.runQuery("assessments/listAssessments", {
        tenantId: args.tenantId,
        olderThan: cutoffDate,
        limit: 1000,
      })

      const results = {
        assessmentsFound: oldAssessments.length,
        assessmentsArchived: 0,
        imagesRemoved: 0,
        storageFreed: 0,
        dryRun,
      }

      if (dryRun) {
        // Just return the count in dry run mode
        return results
      }

      // Process each assessment
      for (const assessment of oldAssessments) {
        // Archive the assessment
        await ctx.runMutation("assessments/updateAssessment", {
          assessmentId: assessment._id,
          tenantId: args.tenantId,
          updates: {
            status: "archived",
            updatedAt: Date.now(),
          },
        })

        results.assessmentsArchived++

        // Remove images from storage to free up space
        if (assessment.images && assessment.images.length > 0) {
          for (const imageUrl of assessment.images) {
            // Extract storage ID from URL if needed
            const storageId = imageUrl.includes("/") ? imageUrl.substring(imageUrl.lastIndexOf("/") + 1) : imageUrl

            // Delete from storage
            try {
              await ctx.storage.delete(storageId)
              results.imagesRemoved++
              results.storageFreed += 1 // Approximate size in MB
            } catch (error) {
              console.warn(`Failed to delete image ${storageId}:`, error)
            }
          }

          // Update assessment to remove image references
          await ctx.runMutation("assessments/updateAssessment", {
            assessmentId: assessment._id,
            tenantId: args.tenantId,
            updates: {
              images: [],
              updatedAt: Date.now(),
            },
          })
        }
      }

      return results
    } catch (error) {
      console.error("Error cleaning up old data:", error)
      throw new Error(`Data cleanup failed: ${error}`)
    }
  },
})
