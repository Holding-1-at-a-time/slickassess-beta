import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  bookings: defineTable({
    tenantId: v.string(),
    vehicleId: v.string(),
    serviceType: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    status: v.union(v.literal("confirmed"), v.literal("pending"), v.literal("canceled")),
    notes: v.optional(v.string()),
    googleEventId: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
  }),
})
