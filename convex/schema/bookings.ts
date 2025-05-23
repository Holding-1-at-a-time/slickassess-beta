import { defineTable } from "convex/server"
import { v } from "convex/values"

export default defineTable({
  tenantId: v.string(),
  vehicleId: v.string(),
  customerId: v.optional(v.string()),
  customerName: v.string(),
  customerEmail: v.string(),
  customerPhone: v.optional(v.string()),
  serviceType: v.string(),
  startTime: v.string(),
  endTime: v.string(),
  duration: v.number(), // in minutes
  status: v.union(
    v.literal("pending"),
    v.literal("confirmed"),
    v.literal("completed"),
    v.literal("canceled"),
    v.literal("no-show"),
  ),
  notes: v.optional(v.string()),
  staffId: v.optional(v.string()),
  staffName: v.optional(v.string()),
  price: v.optional(v.number()),
  // Google Calendar integration
  googleEventId: v.optional(v.string()),
  googleEventLink: v.optional(v.string()),
  // Reminders
  reminderSent: v.optional(v.boolean()),
  reminderSentAt: v.optional(v.string()),
  // Metadata
  createdAt: v.string(),
  updatedAt: v.string(),
})
