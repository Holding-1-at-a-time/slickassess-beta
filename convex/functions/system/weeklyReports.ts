// Import the error tracking utility
import { trackError } from "../../lib/errorTracking"
import { query } from "../../_generated/server"

// Define a query to fetch all tenants
const getTenants = query(async ({ db }) => {
  return await db.table("tenants").collect()
})

// Inside the function
export default async function generateWeeklyReports() {
  const results = {
    success: 0,
    errors: 0,
    failedTenants: [] as { id: string; error: string }[],
  }

  // Fetch all tenants
  const tenants = await getTenants()

  // Process each tenant
  for (const tenant of tenants) {
    try {
      // Process tenant logic
      // ...
      results.success++
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error(`Error processing tenant ${tenant._id}:`, error)

      // Track the error with tenant information for debugging
      trackError("weeklyReportGeneration", {
        tenantId: tenant._id,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      })

      results.failedTenants.push({
        id: tenant._id,
        error: errorMessage,
      })
      results.errors++
    }
  }

  // Return detailed results for monitoring
  return results
}
