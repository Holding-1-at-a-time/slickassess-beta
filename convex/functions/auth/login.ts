import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { ConvexError } from "convex/values"
import bcrypt from "bcryptjs"

export default mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()

    if (!user) {
      throw new ConvexError("Invalid email or password")
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(args.password, user.passwordHash)
    if (!isMatch) {
      throw new ConvexError("Invalid email or password")
    }

    // Update last login time
    await ctx.db.patch(user._id, {
      lastLoginAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Generate a session token
    const token = crypto.randomUUID()
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days

    // Create a session
    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
      createdAt: Date.now(),
    })

    return {
      token,
      userId: user._id,
      expiresAt,
      tenantId: user.tenantId,
    }
  },
})
