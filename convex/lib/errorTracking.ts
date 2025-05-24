/**
 * Tracks errors for monitoring and debugging purposes
 * @param category The category of the error
 * @param details Details about the error
 */
export function trackError(category: string, details: Record<string, any>) {
  // In production, this could send to a monitoring service
  // For now, we'll just log it with structured data
  console.error(`[ERROR][${category}]`, JSON.stringify(details, null, 2))

  // Store in database for later analysis if needed
  // ctx.db.insert('errorLogs', { category, details, timestamp: new Date() });
}
