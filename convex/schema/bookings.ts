import { defineTable } from "convex/server"
import { v } from "convex/values"

export default defineTable({
  tenantId: v.string(),
  vehicleId: v.string(),
  customerId: v.string(),
  serviceType: v.string(),
  startTime: v.number(), // Unix timestamp
  endTime: v.number(), // Unix timestamp
  duration: v.number(), // in minutes
  status: v.union(v.literal("confirmed"), v.literal("pending"), v.literal("canceled"), v.literal("completed")),
  notes: v.optional(v.string()),
  googleEventId: v.optional(v.string()), // ID of the event in Google Calendar
  reminderSent: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
})
