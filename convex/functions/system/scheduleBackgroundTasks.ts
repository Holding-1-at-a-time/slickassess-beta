import { internalAction } from "../../_generated/server"
import { internal } from "../../_generated/api"

export default internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      // Schedule daily maintenance to run at midnight
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)

      await ctx.scheduler.runAt(midnight.getTime(), internal.system.dailyMaintenance, {})

      // Schedule weekly reports to run on Sunday at midnight
      const sunday = new Date()
      sunday.setDate(sunday.getDate() + ((7 - sunday.getDay()) % 7))
      sunday.setHours(0, 0, 0, 0)

      await ctx.scheduler.runAt(sunday.getTime(), internal.system.weeklyReports, {})

      // Schedule data sync to run every 6 hours
      const sixHoursFromNow = new Date()
      sixHoursFromNow.setHours(sixHoursFromNow.getHours() + 6)

      await ctx.scheduler.runAt(sixHoursFromNow.getTime(), internal.system.syncExternalData, {
        source: "pricing",
      })

      return {
        success: true,
        scheduledTasks: 3,
        nextDailyMaintenance: midnight.toISOString(),
        nextWeeklyReport: sunday.toISOString(),
        nextDataSync: sixHoursFromNow.toISOString(),
      }
    } catch (error) {
      console.error("Error scheduling background tasks:", error)
      throw new Error(`Failed to schedule background tasks: ${error}`)
    }
  },
})
