/**
 * Startup checks to ensure the application is properly configured
 */

import { checkEnvironment } from "./env-validator"
import { googleCalendarClient } from "./googleCalendarClient"

export async function runStartupChecks(): Promise<void> {
  console.log("🚀 Running startup checks...")

  // 1. Check environment variables
  console.log("📋 Checking environment variables...")
  const envCheck = checkEnvironment()

  if (!envCheck.valid) {
    console.error("❌ Environment validation failed:")
    envCheck.errors.forEach((error) => console.error(`   - ${error}`))
    throw new Error("Startup checks failed: Invalid environment configuration")
  }

  console.log("✅ Environment variables validated")

  // 2. Test Google Calendar connection
  console.log("📅 Testing Google Calendar connection...")
  try {
    // Try to fetch slots for today to test the connection
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    await googleCalendarClient.getAvailableSlots(today.toISOString(), tomorrow.toISOString(), 30)
    console.log("✅ Google Calendar connection successful")
  } catch (error) {
    console.error("❌ Google Calendar connection failed:", error)
    // Don't throw here - allow the app to start but log the warning
    console.warn("⚠️  Application starting with limited functionality")
  }

  // 3. Check Convex connection
  console.log("🔗 Checking Convex connection...")
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.warn("⚠️  Convex URL not configured - database features will be limited")
  } else {
    console.log("✅ Convex URL configured")
  }

  console.log("🎉 Startup checks completed")
}

// Run checks if this is the main module
if (require.main === module) {
  runStartupChecks()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
