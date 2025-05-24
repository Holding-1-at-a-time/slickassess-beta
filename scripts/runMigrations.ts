import { ConvexHttpClient } from "convex/browser"
import { api } from "../convex/_generated/api"

async function runMigrations() {
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

  try {
    console.log("Checking for pending migrations...")

    const pending = await client.query(api.migrations.getPendingMigrations)

    if (pending.length === 0) {
      console.log("No pending migrations found.")
      return
    }

    console.log(`Found ${pending.length} pending migrations:`)
    pending.forEach((m) => {
      console.log(`  - ${m.name} v${m.version}: ${m.description || "No description"}`)
    })

    for (const migration of pending) {
      console.log(`\nRunning migration: ${migration.name} v${migration.version}`)

      try {
        const result = await client.mutation(api.migrations.runMigration, {
          name: migration.name,
          version: migration.version,
        })

        console.log(`✓ Migration completed successfully`)
      } catch (error) {
        console.error(`✗ Migration failed:`, error)
        process.exit(1)
      }
    }

    console.log("\nAll migrations completed successfully!")
  } catch (error) {
    console.error("Migration runner error:", error)
    process.exit(1)
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations()
}
