import type { ConvexClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

export interface NotificationOptions {
  userId: string
  tenantId: string
  title: string
  message: string
  type: "system_notification" | "assessment_update" | "booking_update" | "payment_notification" | "team_activity"
  priority?: "low" | "medium" | "high" | "urgent"
  category?: string
  metadata?: any
  expiresIn?: number
  relatedId?: any
  actionUrl?: string
}

export class NotificationService {
  private client: ConvexClient

  constructor(client: ConvexClient) {
    this.client = client
  }

  async sendNotification(options: NotificationOptions) {
    return this.client.mutation(api.notifications.createNotification, options)
  }

  // Helper methods for common notification types
  async sendAssessmentNotification(options: Omit<NotificationOptions, "type"> & { assessmentId: string }) {
    const { assessmentId, ...rest } = options

    return this.sendNotification({
      ...rest,
      type: "assessment_update",
      category: "assessments",
      relatedId: assessmentId,
      actionUrl: `/dashboard/assessments/${assessmentId}`,
    })
  }

  async sendBookingNotification(options: Omit<NotificationOptions, "type"> & { bookingId: string }) {
    const { bookingId, ...rest } = options

    return this.sendNotification({
      ...rest,
      type: "booking_update",
      category: "bookings",
      relatedId: bookingId,
      actionUrl: `/dashboard/bookings/${bookingId}`,
    })
  }

  async sendPaymentNotification(options: Omit<NotificationOptions, "type"> & { paymentId: string }) {
    const { paymentId, ...rest } = options

    return this.sendNotification({
      ...rest,
      type: "payment_notification",
      category: "payments",
      relatedId: paymentId,
      actionUrl: `/dashboard/payments/${paymentId}`,
    })
  }

  async sendSystemNotification(options: Omit<NotificationOptions, "type">) {
    return this.sendNotification({
      ...options,
      type: "system_notification",
      category: "system",
    })
  }

  async sendTeamNotification(options: Omit<NotificationOptions, "type">) {
    return this.sendNotification({
      ...options,
      type: "team_activity",
      category: "team",
    })
  }
}

// Create a singleton instance
let notificationService: NotificationService | null = null

export function getNotificationService(client: ConvexClient) {
  if (!notificationService) {
    notificationService = new NotificationService(client)
  }
  return notificationService
}
