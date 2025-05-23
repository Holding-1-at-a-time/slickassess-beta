import { query } from "../_generated/server"
import { v } from "convex/values"

export const listBookingsByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    status: v.optional(v.union(v.literal("confirmed"), v.literal("pending"), v.literal("canceled"))),
    tenantId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let bookingsQuery = ctx.db
      .query("bookings")
      .filter((q) => q.gte(q.field("startTime"), args.startDate))
      .filter((q) => q.lte(q.field("startTime"), args.endDate))

    if (args.status) {
      bookingsQuery = bookingsQuery.filter((q) => q.eq(q.field("status"), args.status))
    }

    if (args.tenantId) {
      bookingsQuery = bookingsQuery.filter((q) => q.eq(q.field("tenantId"), args.tenantId))
    }

    return await bookingsQuery.collect()
  },
})
