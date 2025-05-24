import { internalAction } from "../../_generated/server"
import { sendEmail } from "../../../lib/gmailClient"

export default internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      const results = {
        tenants: 0,
        reportsSent: 0,
      }

      // Get all active tenants
      const tenants = await ctx.runQuery("tenants/listActiveTenants", {})
      results.tenants = tenants.length

      // Get date range for the past week
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)

      // For each tenant, generate and send weekly report
      for (const tenant of tenants) {
        try {
          // Skip tenants without admin email
          if (!tenant.email) continue

          // Get assessment stats for the past week
          const stats = await ctx.runQuery("assessments/getStats", {
            tenantId: tenant._id,
            startDate: startDate.getTime(),
            endDate: endDate.getTime(),
          })

          // Generate HTML report
          const reportHtml = `
            <h1>Weekly Assessment Report: ${tenant.name}</h1>
            <p>Report period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}</p>
            
            <h2>Summary</h2>
            <table border="1" cellpadding="5" style="border-collapse: collapse;">
              <tr>
                <th>Metric</th>
                <th>Count</th>
              </tr>
              <tr>
                <td>New Assessments</td>
                <td>${stats.new}</td>
              </tr>
              <tr>
                <td>Completed Assessments</td>
                <td>${stats.completed}</td>
              </tr>
              <tr>
                <td>Approved Assessments</td>
                <td>${stats.approved}</td>
              </tr>
              <tr>
                <td>Rejected Assessments</td>
                <td>${stats.rejected}</td>
              </tr>
              <tr>
                <td>Average Estimated Price</td>
                <td>$${stats.averagePrice.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Total Estimated Revenue</td>
                <td>$${stats.totalRevenue.toFixed(2)}</td>
              </tr>
            </table>
            
            <h2>Top Issues Detected</h2>
            <table border="1" cellpadding="5" style="border-collapse: collapse;">
              <tr>
                <th>Issue Type</th>
                <th>Count</th>
                <th>Average Severity</th>
              </tr>
              ${stats.topIssues
                .map(
                  (issue) => `
                <tr>
                  <td>${issue.type}</td>
                  <td>${issue.count}</td>
                  <td>${issue.averageSeverity.toFixed(1)}</td>
                </tr>
              `,
                )
                .join("")}
            </table>
            
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/${tenant._id}/dashboard/assessments">
                View All Assessments
              </a>
            </p>
          `

          // Send email report
          await sendEmail({
            to: tenant.email,
            subject: `Weekly Assessment Report: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
            body: reportHtml,
          })

          results.reportsSent++
        } catch (error) {
          console.error(`Error generating report for tenant ${tenant._id}:`, error)
        }
      }

      return results
    } catch (error) {
      console.error("Error generating weekly reports:", error)
      throw new Error(`Weekly reports failed: ${error}`)
    }
  },
})
