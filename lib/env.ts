/**
 * Utility for validating environment variables
 */

export function validateEnv() {
  const requiredVars = [
    "NEXT_PUBLIC_CONVEX_URL",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_PRIVATE_KEY",
    "GOOGLE_CALENDAR_ID",
    "TOGETHER_API_KEY",
  ]

  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(", ")}`)
    return false
  }

  return true
}

export function getEnvVar(name: string, fallback = ""): string {
  const value = process.env[name]
  if (!value) {
    console.warn(`Environment variable ${name} is not set, using fallback value`)
    return fallback
  }
  return value
}
