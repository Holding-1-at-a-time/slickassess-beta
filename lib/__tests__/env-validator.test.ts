/**
 * Unit tests for environment variable validation
 */

import { validateEnvironment, checkEnvironment, getConfig } from "../env-validator"
import { ConfigurationError } from "../errors"

describe("Environment Validator", () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv
  })

  describe("validateEnvironment", () => {
    it("should validate all required environment variables", () => {
      process.env = {
        NEXT_PUBLIC_CONVEX_URL: "https://test.convex.cloud",
        GOOGLE_SERVICE_ACCOUNT_EMAIL: "test@example.com",
        GOOGLE_PRIVATE_KEY: "test-key\\nwith\\nnewlines",
        GOOGLE_CALENDAR_ID: "calendar@example.com",
        TOGETHER_API_KEY: "test-api-key",
      }

      const config = validateEnvironment()

      expect(config.NEXT_PUBLIC_CONVEX_URL).toBe("https://test.convex.cloud")
      expect(config.GOOGLE_SERVICE_ACCOUNT_EMAIL).toBe("test@example.com")
      expect(config.GOOGLE_PRIVATE_KEY).toBe("test-key\nwith\nnewlines")
      expect(config.GOOGLE_CALENDAR_ID).toBe("calendar@example.com")
      expect(config.TOGETHER_API_KEY).toBe("test-api-key")
    })

    it("should throw ConfigurationError for missing required variables", () => {
      process.env = {
        NEXT_PUBLIC_CONVEX_URL: "https://test.convex.cloud",
        // Missing other required variables
      }

      expect(() => validateEnvironment()).toThrow(ConfigurationError)
    })

    it("should validate email format", () => {
      process.env = {
        NEXT_PUBLIC_CONVEX_URL: "https://test.convex.cloud",
        GOOGLE_SERVICE_ACCOUNT_EMAIL: "invalid-email",
        GOOGLE_PRIVATE_KEY: "test-key",
        GOOGLE_CALENDAR_ID: "calendar@example.com",
        TOGETHER_API_KEY: "test-api-key",
      }

      expect(() => validateEnvironment()).toThrow(ConfigurationError)
    })

    it("should validate URL format", () => {
      process.env = {
        NEXT_PUBLIC_CONVEX_URL: "not-a-url",
        GOOGLE_SERVICE_ACCOUNT_EMAIL: "test@example.com",
        GOOGLE_PRIVATE_KEY: "test-key",
        GOOGLE_CALENDAR_ID: "calendar@example.com",
        TOGETHER_API_KEY: "test-api-key",
      }

      expect(() => validateEnvironment()).toThrow(ConfigurationError)
    })
  })

  describe("checkEnvironment", () => {
    it("should return valid status when all variables are set", () => {
      process.env = {
        NEXT_PUBLIC_CONVEX_URL: "https://test.convex.cloud",
        GOOGLE_SERVICE_ACCOUNT_EMAIL: "test@example.com",
        GOOGLE_PRIVATE_KEY: "test-key",
        GOOGLE_CALENDAR_ID: "calendar@example.com",
        TOGETHER_API_KEY: "test-api-key",
      }

      const result = checkEnvironment()

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it("should return errors when validation fails", () => {
      process.env = {}

      const result = checkEnvironment()

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe("getConfig", () => {
    it("should cache the configuration", () => {
      process.env = {
        NEXT_PUBLIC_CONVEX_URL: "https://test.convex.cloud",
        GOOGLE_SERVICE_ACCOUNT_EMAIL: "test@example.com",
        GOOGLE_PRIVATE_KEY: "test-key",
        GOOGLE_CALENDAR_ID: "calendar@example.com",
        TOGETHER_API_KEY: "test-api-key",
      }

      const config1 = getConfig()
      const config2 = getConfig()

      expect(config1).toBe(config2) // Same reference
    })
  })
})
