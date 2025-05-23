import { v } from "convex/values"
import { internalMutation } from "./_generated/server"

export default internalMutation({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      reminderSent: true,
      updatedAt: Date.now(),
    })
  },
})
