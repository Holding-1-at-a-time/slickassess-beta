/**
 * Global error handling middleware
 */

import { type NextRequest, NextResponse } from "next/server"
import { sanitizeError } from "@/lib/errors"

/**
 * Error handling middleware for API routes
 */
export function withErrorHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error) {
      console.error("API Error:", error)

      const sanitized = sanitizeError(error)

      return NextResponse.json(
        {
          error: sanitized.message,
          code: sanitized.code,
          ...(process.env.NODE_ENV === "development" && {
            details: sanitized.details,
            stack: error instanceof Error ? error.stack : undefined,
          }),
        },
        { status: sanitized.statusCode },
      )
    }
  }
}

/**
 * Rate limiting middleware
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options = { windowMs: 60000, max: 100 },
) {
  return async (req: NextRequest) => {
    const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown"
    const now = Date.now()

    let requestData = requestCounts.get(ip)

    if (!requestData || now > requestData.resetTime) {
      requestData = {
        count: 0,
        resetTime: now + options.windowMs,
      }
      requestCounts.set(ip, requestData)
    }

    requestData.count++

    if (requestData.count > options.max) {
      return NextResponse.json(
        {
          error: "Too many requests",
          code: "RATE_LIMIT_ERROR",
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((requestData.resetTime - now) / 1000)),
          },
        },
      )
    }

    return handler(req)
  }
}

/**
 * Combine multiple middleware
 */
export function withMiddleware(
  handler: (req: NextRequest) => Promise<NextResponse>,
  ...middleware: Array<
    (handler: (req: NextRequest) => Promise<NextResponse>) => (req: NextRequest) => Promise<NextResponse>
  >
) {
  return middleware.reduce((acc, mid) => mid(acc), handler)
}
