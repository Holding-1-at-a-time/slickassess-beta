import { internalAction } from "../../_generated/server"
import { v } from "convex/values"
import { internal } from "../../_generated/api"

export default internalAction({
  args: {
    tenantId: v.string(),
    status: v.optional(v.string()),
    olderThan: v.optional(v.number()), // Timestamp in milliseconds
    newerThan: v.optional(v.number()), // Timestamp in milliseconds
    limit: v.optional(v.number()),
    operation: v.union(
      v.literal("generateReports"),
      v.literal("sendReminders"),
      v.literal("archive"),
      v.literal("reanalyze"),
    ),
  },
  handler: async (ctx, args) => {
    try {
      // Build query to get assessments matching criteria
      const query = {
        tenantId: args.tenantId,
      }

      if (args.status) {
        query.status = args.status
      }

      // Get assessments matching criteria
      const assessments = await ctx.runQuery("assessments/listAssessments", {
        ...query,
        olderThan: args.olderThan,
        newerThan: args.newerThan,
        limit: args.limit || 100,
      })

      // Process each assessment based on the operation
      const results = []

      for (const assessment of assessments) {
        try {
          switch (args.operation) {
            case "generateReports":
              // Generate report for each assessment
              const reportResult = await ctx.runAction(internal.assessments.generateReport, {
                assessmentId: assessment._id,
                tenantId: args.tenantId,
              })
              results.push({ assessmentId: assessment._id, success: true, reportUrl: reportResult.reportUrl })
              break

            case "sendReminders":
              // Send reminder for each assessment
              const reminderResult = await ctx.runAction(internal.assessments.sendStatusNotification, {
                assessmentId: assessment._id,
                tenantId: args.tenantId,
                newStatus: assessment.status,
              })
              results.push({ assessmentId: assessment._id, success: true, emailSent: reminderResult.emailSent })
              break

            case "archive":
              // Archive old assessments
              await ctx.runMutation("assessments/updateAssessment", {
                assessmentId: assessment._id,
                tenantId: args.tenantId,
                updates: {
                  status: "archived",
                  updatedAt: Date.now(),
                },
              })
              results.push({ assessmentId: assessment._id, success: true, operation: "archived" })
              break

            case "reanalyze":
              // Re-run AI analysis on assessments
              if (assessment.images && assessment.images.length > 0) {
                await ctx.runAction(internal.assessments.analyzeImages, {
                  assessmentId: assessment._id,
                  tenantId: args.tenantId,
                })
                results.push({ assessmentId: assessment._id, success: true, operation: "reanalyzed" })
              } else {
                results.push({ assessmentId: assessment._id, success: false, error: "No images to analyze" })
              }
              break
          }
        } catch (error) {
          results.push({ assessmentId: assessment._id, success: false, error: error.message })
        }
      }

      return {
        success: true,
        processed: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        results,
      }
    } catch (error) {
      console.error("Error in batch processing:", error)
      throw new Error(`Batch processing failed: ${error}`)
    }
  },
})
