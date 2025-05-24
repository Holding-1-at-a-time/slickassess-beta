import { mutation } from "../_generated/server"
import { v } from "convex/values"
import { ConvexError } from "convex/values"
import bcrypt from "bcryptjs"

export default mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first()

    if (existingUser) {
      throw new ConvexError("User with this email already exists")
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(args.password, salt)

    // Create the user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash,
      tenantId: args.tenantId,
      role: "user", // Default role
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isActive: true,
    })

    // Generate a session token
    const token = crypto.randomUUID()
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days

    // Create a session
    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
      createdAt: Date.now(),
    })

    return { token, userId, expiresAt }
  },
})
