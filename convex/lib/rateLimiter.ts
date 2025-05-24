import { ConvexError } from "convex/values"

// Rate limiter configuration
export const RATE_LIMITS = {
  // API endpoints
  createAssessment: { windowMs: 60000, maxRequests: 10 }, // 10 requests per minute
  uploadImage: { windowMs: 60000, maxRequests: 30 }, // 30 uploads per minute
  aiAnalysis: { windowMs: 300000, maxRequests: 5 }, // 5 analyses per 5 minutes
  generateReport: { windowMs: 3600000, maxRequests: 20 }, // 20 reports per hour

  // Chat endpoints
  chatMessage: { windowMs: 60000, maxRequests: 60 }, // 60 messages per minute

  // Public endpoints
  publicAssessment: { windowMs: 300000, maxRequests: 50 }, // 50 requests per 5 minutes
} as const

export type RateLimitKey = keyof typeof RATE_LIMITS

// Helper function to get rate limit key
export function getRateLimitKey(action: RateLimitKey, identifier: string): string {
  return `${action}:${identifier}`
}

// Check if rate limit is exceeded
export async function checkRateLimit(ctx: any, action: RateLimitKey, identifier: string): Promise<boolean> {
  const config = RATE_LIMITS[action]
  const key = getRateLimitKey(action, identifier)
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Get all requests within the window
  const requests = await ctx.db
    .query("rateLimits")
    .withIndex("by_key_and_timestamp", (q: any) => q.eq("key", key).gte("timestamp", windowStart))
    .collect()

  // Check if limit is exceeded
  if (requests.length >= config.maxRequests) {
    const oldestRequest = requests[0]
    const resetTime = oldestRequest.timestamp + config.windowMs
    const waitTime = Math.ceil((resetTime - now) / 1000)

    throw new ConvexError({
      code: "RATE_LIMIT_EXCEEDED",
      message: `Rate limit exceeded. Please try again in ${waitTime} seconds.`,
      retryAfter: waitTime,
    })
  }

  // Record this request
  await ctx.db.insert("rateLimits", {
    key,
    identifier,
    action,
    timestamp: now,
  })

  // Clean up old entries (optional, can be done in a scheduled function)
  const expiredRequests = await ctx.db
    .query("rateLimits")
    .withIndex("by_timestamp", (q: any) => q.lt("timestamp", windowStart))
    .take(100)

  for (const request of expiredRequests) {
    await ctx.db.delete(request._id)
  }

  return true
}

// Middleware wrapper for rate limiting
export function withRateLimit<Args extends Record<string, any>, Output>(
  action: RateLimitKey,
  getIdentifier: (args: Args, ctx: any) => string,
  handler: (args: Args, ctx: any) => Promise<Output>,
) {
  return async (args: Args, ctx: any): Promise<Output> => {
    const identifier = getIdentifier(args, ctx)
    await checkRateLimit(ctx, action, identifier)
    return handler(args, ctx)
  }
}
