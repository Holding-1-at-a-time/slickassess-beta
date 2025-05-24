import { mutation } from "../../_generated/server"

// HTML sanitizer utility
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Safe email template renderer
function renderWeeklyReportEmail(data: {
  tenantName: string
  assessmentCount: number
  totalRevenue: number
  topVehicles: Array<{ make: string; model: string; count: number }>
}) {
  // Sanitize all user-provided data
  const safe = {
    tenantName: escapeHtml(data.tenantName),
    assessmentCount: data.assessmentCount,
    totalRevenue: data.totalRevenue,
    topVehicles: data.topVehicles.map((v) => ({
      make: escapeHtml(v.make),
      model: escapeHtml(v.model),
      count: v.count,
    })),
  }

  // Use a template engine or safe string interpolation
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Weekly Report - ${safe.tenantName}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
        .stats { margin: 20px 0; }
        .stat-box { background-color: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Weekly Report</h1>
          <h2>${safe.tenantName}</h2>
        </div>
        
        <div class="stats">
          <div class="stat-box">
            <h3>Assessment Summary</h3>
            <p>Total Assessments: <strong>${safe.assessmentCount}</strong></p>
            <p>Total Revenue: <strong>$${safe.totalRevenue.toFixed(2)}</strong></p>
          </div>
          
          <div class="stat-box">
            <h3>Top Vehicles</h3>
            <table>
              <thead>
                <tr>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                ${safe.topVehicles
                  .map(
                    (v) => `
                  <tr>
                    <td>${v.make}</td>
                    <td>${v.model}</td>
                    <td>${v.count}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666;">
          <p>This is an automated report. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export default mutation({
  args: {},
  handler: async (ctx) => {
    // Fetch report data and generate emails using the safe template function
    const results = {
      success: 0,
      errors: 0,
      failedTenants: [] as Array<{ id: string; error: string }>,
    }

    try {
      // Example: Fetch tenants and generate reports
      const tenants = await ctx.db.query("tenants").collect()

      for (const tenant of tenants) {
        try {
          // Fetch assessment data
          const assessments = await ctx.db
            .query("assessments")
            .filter((q) => q.eq(q.field("tenantId"), tenant._id))
            .collect()

          // Calculate stats
          const stats = {
            tenantName: tenant.name,
            assessmentCount: assessments.length,
            totalRevenue: assessments.reduce((sum, a) => sum + (a.estimatedPrice || 0), 0),
            topVehicles: [], // Calculate top vehicles...
          }

          // Generate safe HTML email
          const emailHtml = renderWeeklyReportEmail(stats)

          // Send email (implement your email sending logic)
          // await sendEmail(tenant.email, 'Weekly Report', emailHtml)

          results.success++
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          results.failedTenants.push({ id: tenant._id, error: errorMessage })
          results.errors++
        }
      }
    } catch (error) {
      console.error("Failed to generate weekly reports:", error)
    }

    return results
  },
})
