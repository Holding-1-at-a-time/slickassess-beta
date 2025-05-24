import { mutation } from "../_generated/server"

// Background job to clean expired entries
export const cleanupExpiredEntries = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const batchSize = 100 // Process in batches to avoid timeout

    // Get expired entries in batches
    const expired = await ctx.db
      .query("rateLimits")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .take(batchSize)

    // Delete expired entries
    for (const entry of expired) {
      await ctx.db.delete(entry._id)
    }

    // Return number of cleaned entries for monitoring
    return { cleaned: expired.length }
  },
})

// Rate limiting check function
export async function checkRateLimit(
  ctx: any,
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now()
  const windowStart = now - windowMs

  // Get current entries for this key within the window
  const entries = await ctx.db
    .query("rateLimits")
    .filter((q) => q.and(q.eq(q.field("key"), key), q.gte(q.field("timestamp"), windowStart)))
    .collect()

  const count = entries.length

  if (count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  // Add new entry
  await ctx.db.insert("rateLimits", {
    key,
    timestamp: now,
    expiresAt: now + windowMs,
  })

  // Don't clean on every request - let background job handle it
  // This avoids performance impact on the hot path

  return { allowed: true, remaining: limit - count - 1 }
}

// Schedule this to run periodically (e.g., every hour)
export const scheduleCleanup = mutation({
  args: {},
  handler: async (ctx) => {
    // This would be called by a cron job or scheduled task
    await cleanupExpiredEntries(ctx, {})
  },
})
