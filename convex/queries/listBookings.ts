import { v } from "convex/values"
import { query } from "./_generated/server"

export default query({
  args: {
    tenantId: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("completed"),
        v.literal("canceled"),
        v.literal("no-show"),
      ),
    ),
    vehicleId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let bookingsQuery = ctx.db.query("bookings").filter((q) => q.eq(q.field("tenantId"), args.tenantId))

    // Apply optional filters
    if (args.startDate) {
      bookingsQuery = bookingsQuery.filter((q) => q.gte(q.field("startTime"), args.startDate!))
    }

    if (args.endDate) {
      bookingsQuery = bookingsQuery.filter((q) => q.lt(q.field("startTime"), args.endDate!))
    }

    if (args.status) {
      bookingsQuery = bookingsQuery.filter((q) => q.eq(q.field("status"), args.status!))
    }

    if (args.vehicleId) {
      bookingsQuery = bookingsQuery.filter((q) => q.eq(q.field("vehicleId"), args.vehicleId!))
    }

    // Order by start time
    bookingsQuery = bookingsQuery.order("desc")

    return await bookingsQuery.collect()
  },
})
