import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
    email: v.string(),
    picture: v.optional(v.string()),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),
  tenants: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
  }).index("by_owner", ["ownerId"]),
  files: defineTable({
    name: v.string(),
    storageId: v.id("_storage"),
    contentType: v.string(),
    size: v.number(),
    tenantId: v.id("tenants"),
    uploadedBy: v.id("users"),
    uploadedAt: v.number(),
    isPrivate: v.optional(v.boolean()),
    allowedUsers: v.optional(v.array(v.id("users"))),
    updatedAt: v.optional(v.number()),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_tenant", ["tenantId"])
    .index("by_uploader", ["uploadedBy"])
    .index("by_storage", ["storageId"]),
})
