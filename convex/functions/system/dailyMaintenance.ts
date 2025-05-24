import { internalAction } from "../../_generated/server"
import { internal } from "../../_generated/api"

export default internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      const results = {
        tenants: 0,
        assessmentsCleaned: 0,
        reportsGenerated: 0,
        remindersSent: 0,
      }

      // Get all active tenants
      const tenants = await ctx.runQuery("tenants/listActiveTenants", {})
      results.tenants = tenants.length

      // For each tenant, perform maintenance tasks
      for (const tenant of tenants) {
        try {
          // 1. Clean up old data (older than 1 year)
          const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000
          const cleanupResult = await ctx.runAction(internal.assessments.cleanupOldData, {
            tenantId: tenant._id,
            olderThan: oneYearAgo,
            dryRun: false,
          })

          results.assessmentsCleaned += cleanupResult.assessmentsArchived

          // 2. Generate reports for completed assessments without reports
          const reportResult = await ctx.runAction(internal.assessments.batchProcess, {
            tenantId: tenant._id,
            status: "completed",
            operation: "generateReports",
          })

          results.reportsGenerated += reportResult.successful

          // 3. Send reminders for pending assessments
          const reminderResult = await ctx.runAction(internal.assessments.batchProcess, {
            tenantId: tenant._id,
            status: "pending",
            olderThan: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days old
            operation: "sendReminders",
          })

          results.remindersSent += reminderResult.successful
        } catch (error) {
          console.error(`Error processing tenant ${tenant._id}:`, error)
        }
      }

      return results
    } catch (error) {
      console.error("Error in daily maintenance:", error)
      throw new Error(`Daily maintenance failed: ${error}`)
    }
  },
})
