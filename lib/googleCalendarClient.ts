import { google, type calendar_v3 } from "googleapis"

// Type for available time slots
export interface AvailableTimeSlot {
  start: string
  end: string
  staffId?: string
  staffName?: string
}

// Type for booking creation
export interface BookingRequest {
  title: string
  description: string
  startTime: string
  endTime: string
  attendeeEmail: string
  serviceType: string
  vehicleId: string
  tenantId: string
  staffId?: string
}

// Type for calendar event result
export interface CalendarEventResult {
  eventId: string
  htmlLink: string
  status: string
}

export class GoogleCalendarClient {
  private calendar: calendar_v3.Calendar
  private calendarId: string

  constructor(calendarId: string) {
    // Initialize the Google Calendar API client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/calendar"],
    })

    this.calendar = google.calendar({ version: "v3", auth })
    this.calendarId = calendarId
  }

  /**
   * Fetch available time slots for a given date range and duration
   */
  async fetchAvailableSlots(startDate: string, endDate: string, durationMinutes: number): Promise<AvailableTimeSlot[]> {
    try {
      // Get busy times from the calendar
      const busyTimesResponse = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: startDate,
          timeMax: endDate,
          items: [{ id: this.calendarId }],
        },
      })

      const busyTimes = busyTimesResponse.data.calendars?.[this.calendarId]?.busy || []

      // Generate time slots (9 AM to 5 PM)
      const availableSlots: AvailableTimeSlot[] = []
      const currentDate = new Date(startDate)
      const endDateObj = new Date(endDate)

      while (currentDate < endDateObj) {
        // Skip weekends
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          // Start at 9 AM
          const dayStart = new Date(currentDate)
          dayStart.setHours(9, 0, 0, 0)

          // End at 5 PM
          const dayEnd = new Date(currentDate)
          dayEnd.setHours(17, 0, 0, 0)

          // Generate slots with the specified duration
          let slotStart = new Date(dayStart)

          while (slotStart < dayEnd) {
            const slotEnd = new Date(slotStart)
            slotEnd.setMinutes(slotStart.getMinutes() + durationMinutes)

            // Check if the slot overlaps with any busy time
            const isAvailable = !busyTimes.some((busy) => {
              const busyStart = new Date(busy.start || "")
              const busyEnd = new Date(busy.end || "")
              return (
                (slotStart >= busyStart && slotStart < busyEnd) ||
                (slotEnd > busyStart && slotEnd <= busyEnd) ||
                (slotStart <= busyStart && slotEnd >= busyEnd)
              )
            })

            if (isAvailable && slotEnd <= dayEnd) {
              availableSlots.push({
                start: slotStart.toISOString(),
                end: slotEnd.toISOString(),
              })
            }

            // Move to the next slot
            slotStart = new Date(slotEnd)
          }
        }

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1)
        currentDate.setHours(0, 0, 0, 0)
      }

      return availableSlots
    } catch (error) {
      console.error("Error fetching available slots:", error)
      throw new Error("Failed to fetch available time slots")
    }
  }

  /**
   * Create a calendar event for a booking
   */
  async createEvent(booking: BookingRequest): Promise<CalendarEventResult> {
    try {
      const event = {
        summary: booking.title,
        description: booking.description,
        start: {
          dateTime: booking.startTime,
          timeZone: "UTC",
        },
        end: {
          dateTime: booking.endTime,
          timeZone: "UTC",
        },
        attendees: [{ email: booking.attendeeEmail }],
        // Add custom properties to link back to our system
        extendedProperties: {
          private: {
            tenantId: booking.tenantId,
            vehicleId: booking.vehicleId,
            serviceType: booking.serviceType,
            bookingSystem: "SlickAssess",
          },
        },
        // Enable notifications
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 }, // 1 day before
            { method: "popup", minutes: 60 }, // 1 hour before
          ],
        },
      }

      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: event,
        sendUpdates: "all", // Send emails to attendees
      })

      return {
        eventId: response.data.id || "",
        htmlLink: response.data.htmlLink || "",
        status: response.data.status || "",
      }
    } catch (error) {
      console.error("Error creating calendar event:", error)
      throw new Error("Failed to create calendar event")
    }
  }

  /**
   * Update a calendar event
   */
  async updateEvent(eventId: string, updates: Partial<BookingRequest>): Promise<CalendarEventResult> {
    try {
      // First get the existing event
      const existingEvent = await this.calendar.events.get({
        calendarId: this.calendarId,
        eventId,
      })

      // Prepare the update payload
      const updatedEvent: calendar_v3.Schema$Event = { ...existingEvent.data }

      if (updates.title) updatedEvent.summary = updates.title
      if (updates.description) updatedEvent.description = updates.description
      if (updates.startTime) updatedEvent.start = { ...updatedEvent.start, dateTime: updates.startTime }
      if (updates.endTime) updatedEvent.end = { ...updatedEvent.end, dateTime: updates.endTime }

      // Update the event
      const response = await this.calendar.events.update({
        calendarId: this.calendarId,
        eventId,
        requestBody: updatedEvent,
        sendUpdates: "all", // Send emails to attendees
      })

      return {
        eventId: response.data.id || "",
        htmlLink: response.data.htmlLink || "",
        status: response.data.status || "",
      }
    } catch (error) {
      console.error("Error updating calendar event:", error)
      throw new Error("Failed to update calendar event")
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId,
        sendUpdates: "all", // Send emails to attendees
      })
    } catch (error) {
      console.error("Error deleting calendar event:", error)
      throw new Error("Failed to delete calendar event")
    }
  }

  /**
   * Set up a webhook for calendar events
   */
  async setupWebhook(webhookUrl: string): Promise<string> {
    try {
      const response = await this.calendar.events.watch({
        calendarId: this.calendarId,
        requestBody: {
          id: `slickassess-webhook-${Date.now()}`,
          type: "web_hook",
          address: webhookUrl,
        },
      })

      return response.data.id || ""
    } catch (error) {
      console.error("Error setting up webhook:", error)
      throw new Error("Failed to set up calendar webhook")
    }
  }
}

// Factory function to create a client instance
export function createGoogleCalendarClient(
  calendarId: string = process.env.GOOGLE_CALENDAR_ID || "",
): GoogleCalendarClient {
  return new GoogleCalendarClient(calendarId)
}
