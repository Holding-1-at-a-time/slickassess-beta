/**
 * Environment variable validation and configuration
 */

import { ConfigurationError } from "./errors"

export interface EnvironmentConfig {
  // Next.js
  NEXT_PUBLIC_CONVEX_URL: string

  // Google Services
  GOOGLE_SERVICE_ACCOUNT_EMAIL: string
  GOOGLE_PRIVATE_KEY: string
  GOOGLE_CALENDAR_ID: string

  // AI Services
  TOGETHER_API_KEY: string

  // Optional
  NODE_ENV?: string
  VERCEL_URL?: string
}

export interface ValidationRule {
  required: boolean
  pattern?: RegExp
  transform?: (value: string) => string
  validate?: (value: string) => boolean
}

const validationRules: Record<keyof EnvironmentConfig, ValidationRule> = {
  NEXT_PUBLIC_CONVEX_URL: {
    required: true,
    pattern: /^https?:\/\/.+/,
  },
  GOOGLE_SERVICE_ACCOUNT_EMAIL: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  GOOGLE_PRIVATE_KEY: {
    required: true,
    transform: (value) => value.replace(/\\n/g, "\n"),
  },
  GOOGLE_CALENDAR_ID: {
    required: true,
    pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/,
  },
  TOGETHER_API_KEY: {
    required: true,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  NODE_ENV: {
    required: false,
    pattern: /^(development|test|production)$/,
  },
  VERCEL_URL: {
    required: false,
    pattern: /^[a-zA-Z0-9.-]+$/,
  },
}

/**
 * Validates environment variables at startup
 */
export function validateEnvironment(): EnvironmentConfig {
  const errors: string[] = []
  const config: Partial<EnvironmentConfig> = {}

  for (const [key, rule] of Object.entries(validationRules) as [keyof EnvironmentConfig, ValidationRule][]) {
    const value = process.env[key]

    if (rule.required && !value) {
      errors.push(`Missing required environment variable: ${key}`)
      continue
    }

    if (value) {
      // Apply transformation if needed
      const processedValue = rule.transform ? rule.transform(value) : value

      // Validate pattern
      if (rule.pattern && !rule.pattern.test(processedValue)) {
        errors.push(`Invalid format for environment variable ${key}`)
        continue
      }

      // Custom validation
      if (rule.validate && !rule.validate(processedValue)) {
        errors.push(`Validation failed for environment variable ${key}`)
        continue
      }

      config[key] = processedValue as any
    }
  }

  if (errors.length > 0) {
    throw new ConfigurationError("Environment validation failed", { errors })
  }

  return config as EnvironmentConfig
}

/**
 * Get validated environment configuration
 */
let cachedConfig: EnvironmentConfig | null = null

export function getConfig(): EnvironmentConfig {
  if (!cachedConfig) {
    cachedConfig = validateEnvironment()
  }
  return cachedConfig
}

/**
 * Check if all required environment variables are set
 */
export function checkEnvironment(): { valid: boolean; errors: string[] } {
  try {
    validateEnvironment()
    return { valid: true, errors: [] }
  } catch (error) {
    if (error instanceof ConfigurationError) {
      return { valid: false, errors: error.details.errors }
    }
    return { valid: false, errors: ["Unknown configuration error"] }
  }
}
