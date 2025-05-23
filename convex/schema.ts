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

  vehicles: defineTable({
    tenantId: v.string(),
    name: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    licensePlate: v.string(),
    vin: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("maintenance"), v.literal("inactive")),
  }),

  tenants: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    logo: v.optional(v.string()),
    settings: v.optional(
      v.object({
        enableNotifications: v.optional(v.boolean()),
        enableCalendarSync: v.optional(v.boolean()),
        enableAutomaticReminders: v.optional(v.boolean()),
      }),
    ),
  }),

  users: defineTable({
    name: v.string(),
    email: v.string(),
    tenantId: v.string(),
    role: v.union(v.literal("admin"), v.literal("staff"), v.literal("customer")),
    authId: v.string(),
  }),

  assessments: defineTable({
    tenantId: v.string(),
    vehicleId: v.string(),
    type: v.string(),
    scheduledDate: v.string(),
    status: v.union(v.literal("scheduled"), v.literal("in_progress"), v.literal("completed"), v.literal("canceled")),
    result: v.optional(v.union(v.literal("passed"), v.literal("failed"), v.literal("pending"))),
    notes: v.optional(v.string()),
    checkItems: v.optional(
      v.array(
        v.object({
          name: v.string(),
          checked: v.boolean(),
          notes: v.optional(v.string()),
        }),
      ),
    ),
  }),
})
