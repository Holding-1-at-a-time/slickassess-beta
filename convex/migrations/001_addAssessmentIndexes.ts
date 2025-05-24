import { registerMigration } from "./migrationRunner"

registerMigration({
  name: "addAssessmentIndexes",
  version: 1,
  description: "Add performance indexes to assessments table",
  up: async (ctx) => {
    // In a real migration, you would modify the schema
    // For this example, we'll just log the migration
    console.log("Adding indexes to assessments table")

    // Track affected records
    const assessments = await ctx.db.query("assessments").collect()

    // Perform any data transformations needed
    for (const assessment of assessments) {
      // Example: ensure all assessments have a createdAt field
      if (!assessment.createdAt) {
        await ctx.db.patch(assessment._id, {
          createdAt: Date.now(),
        })
      }
    }

    return assessments.length
  },
  down: async (ctx) => {
    console.log("Removing indexes from assessments table")
    // Rollback logic here
  },
})
