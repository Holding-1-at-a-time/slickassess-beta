import { defineTable } from "convex/server"
import { v } from "convex/values"

export const usersTable = defineTable({
  name: v.string(),
  email: v.string(),
  passwordHash: v.string(),
  tenantId: v.string(),
  role: v.union(v.literal("admin"), v.literal("user")),
  createdAt: v.number(),
  updatedAt: v.number(),
  lastLoginAt: v.optional(v.number()),
  profileImageUrl: v.optional(v.string()),
  isActive: v.boolean(),
  resetPasswordToken: v.optional(v.string()),
  resetPasswordExpiry: v.optional(v.number()),
})
  .index("by_email", ["email"])
  .index("by_tenant", ["tenantId"])

export const sessionsTable = defineTable({
  userId: v.id("users"),
  token: v.string(),
  expiresAt: v.number(),
  createdAt: v.number(),
  userAgent: v.optional(v.string()),
  ipAddress: v.optional(v.string()),
})
  .index("by_token", ["token"])
  .index("by_user", ["userId"])
  .index("by_expiry", ["expiresAt"])
