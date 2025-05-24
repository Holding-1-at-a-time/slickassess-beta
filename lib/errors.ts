/**
 * Custom error types for better error handling and debugging
 */

export class BaseError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode = 500,
    public details?: any,
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, "VALIDATION_ERROR", 400, details)
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, "AUTHENTICATION_ERROR", 401, details)
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, "AUTHORIZATION_ERROR", 403, details)
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, "NOT_FOUND", 404, details)
  }
}

export class ConflictError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, "CONFLICT", 409, details)
  }
}

export class ExternalServiceError extends BaseError {
  constructor(message: string, service: string, details?: any) {
    super(message, "EXTERNAL_SERVICE_ERROR", 503, { service, ...details })
  }
}

export class ConfigurationError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, "CONFIGURATION_ERROR", 500, details)
  }
}

export class RateLimitError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, "RATE_LIMIT_ERROR", 429, details)
  }
}

/**
 * Type guard to check if an error is a BaseError
 */
export function isBaseError(error: unknown): error is BaseError {
  return error instanceof BaseError
}

/**
 * Safe error handler that doesn't expose sensitive information
 */
export function sanitizeError(error: unknown): {
  message: string
  code: string
  statusCode: number
  details?: any
} {
  if (isBaseError(error)) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    }
  }

  // For unknown errors, return a generic message
  console.error("Unhandled error:", error)
  return {
    message: "An unexpected error occurred",
    code: "INTERNAL_ERROR",
    statusCode: 500,
  }
}
