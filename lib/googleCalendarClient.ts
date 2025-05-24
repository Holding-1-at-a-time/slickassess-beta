/**
 * Google Calendar Client
 *
 * This module provides a singleton client for interacting with Google Calendar API.
 * It handles authentication, event management, and availability checking.
 *
 * @module googleCalendarClient
 */

import { google, type calendar_v3 } from "googleapis"
import { ExternalServiceError, ConfigurationError, ValidationError, NotFoundError } from "./errors"
import { getConfig } from "./env-validator"

/**
 * Google Calendar Client class
 * Provides methods for managing calendar events and checking availability
 */
export class GoogleCalendarClient {
  private calendar: calendar_v3.Calendar | null = null
  private config: ReturnType<typeof getConfig>

  constructor() {
    try {
      this.config = getConfig()
      this.initializeClient()
    } catch (error) {
      console.error("Failed to initialize Google Calendar client:", error)
      // Don't throw - allow graceful degradation
    }
  }

  /**
   * Initialize the Google Calendar API client
   * @private
   */
  private initializeClient(): void {
    try {
      const auth = new google.auth.JWT({
        email: this.config.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: this.config.GOOGLE_PRIVATE_KEY,
        scopes: ["https://www.googleapis.com/auth/calendar"],
      })

      this.calendar = google.calendar({ version: "v3", auth })
    } catch (error) {
      throw new ConfigurationError("Failed to initialize Google Calendar client", { originalError: error })
    }
  }

  /**
   * Validate that the calendar client is properly initialized
   * @private
   * @throws {ConfigurationError} If the client is not initialized
   */
  private validateCalendarClient(): void {
    if (!this.calendar) {
      throw new ConfigurationError("Google Calendar client not initialized. Check your environment variables.")
    }
  }

  /**
   * Get available time slots within a date range
   * @param startDate - Start date in ISO format
   * @param endDate - End date in ISO format
   * @param duration - Duration of each slot in minutes
   * @returns Array of available time slots
   */
  async getAvailableSlots(
    startDate: string,
    endDate: string,
    duration: number,
  ): Promise<{ startTime: string; endTime: string }[]> {
    try {
      this.validateCalendarClient()

      // Validate inputs
      if (!startDate || !endDate) {
        throw new ValidationError("Start date and end date are required")
      }

      if (duration < 15 || duration > 480) {
        throw new ValidationError("Duration must be between 15 and 480 minutes")
      }

      const start = new Date(startDate)
      const end = new Date(endDate)

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new ValidationError("Invalid date format")
      }

      if (start >= end) {
        throw new ValidationError("End date must be after start date")
      }

      // Get busy times from calendar
      const busyTimes = await this.getBusyTimes(startDate, endDate)

      // Generate available time slots
      return this.generateAvailableSlots(startDate, endDate, duration, busyTimes)
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConfigurationError) {
        throw error
      }

      throw new ExternalServiceError("Failed to fetch available slots", "Google Calendar", { originalError: error })
    }
  }

  /**
   * Get busy times from the calendar
   * @private
   */
  private async getBusyTimes(startDate: string, endDate: string): Promise<{ start: string; end: string }[]> {
    try {
      this.validateCalendarClient()

      const response = await this.calendar!.freebusy.query({
        requestBody: {
          timeMin: startDate,
          timeMax: endDate,
          items: [{ id: this.config.GOOGLE_CALENDAR_ID }],
        },
      })

      const busyTimes = response.data.calendars?.[this.config.GOOGLE_CALENDAR_ID]?.busy || []
      return busyTimes.map((time) => ({
        start: time.start || "",
        end: time.end || "",
      }))
    } catch (error) {
      throw new ExternalServiceError("Failed to fetch busy times from calendar", "Google Calendar", {
        originalError: error,
      })
    }
  }

  /**
   * Generate available time slots based on business hours and busy times
   * @private
   */
  private generateAvailableSlots(
    startDate: string,
    endDate: string,
    duration: number,
    busyTimes: { start: string; end: string }[],
  ): { startTime: string; endTime: string }[] {
    const slots: { startTime: string; endTime: string }[] = []
    const startDateTime = new Date(startDate)
    const endDateTime = new Date(endDate)

    // Loop through each day
    const currentDate = new Date(startDateTime)
    while (currentDate <= endDateTime) {
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        // Business hours: 9 AM to 5 PM
        const businessStart = new Date(currentDate)
        businessStart.setHours(9, 0, 0, 0)

        const businessEnd = new Date(currentDate)
        businessEnd.setHours(17, 0, 0, 0)

        // Generate slots for the day
        const slotStart = new Date(businessStart)
        while (slotStart < businessEnd) {
          const slotEnd = new Date(slotStart)
          slotEnd.setMinutes(slotStart.getMinutes() + duration)

          if (slotEnd <= businessEnd) {
            // Check if slot overlaps with any busy time
            const isAvailable = !busyTimes.some((busyTime) => {
              const busyStart = new Date(busyTime.start)
              const busyEnd = new Date(busyTime.end)
              return (
                (slotStart >= busyStart && slotStart < busyEnd) ||
                (slotEnd > busyStart && slotEnd <= busyEnd) ||
                (slotStart <= busyStart && slotEnd >= busyEnd)
              )
            })

            if (isAvailable) {
              slots.push({
                startTime: slotStart.toISOString(),
                endTime: slotEnd.toISOString(),
              })
            }
          }

          // Move to next slot (30-minute increments)
          slotStart.setMinutes(slotStart.getMinutes() + 30)
        }
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
      currentDate.setHours(0, 0, 0, 0)
    }

    return slots
  }

  /**
   * Create a new calendar event
   * @param summary - Event title
   * @param description - Event description
   * @param startTime - Start time in ISO format
   * @param endTime - End time in ISO format
   * @param attendeeEmail - Optional attendee email
   * @returns Google Calendar event ID
   */
  async createEvent(
    summary: string,
    description: string,
    startTime: string,
    endTime: string,
    attendeeEmail?: string,
  ): Promise<string> {
    try {
      this.validateCalendarClient()

      // Validate inputs
      if (!summary || !startTime || !endTime) {
        throw new ValidationError("Summary, start time, and end time are required")
      }

      const event: calendar_v3.Schema$Event = {
        summary,
        description,
        start: {
          dateTime: startTime,
          timeZone: "UTC",
        },
        end: {
          dateTime: endTime,
          timeZone: "UTC",
        },
      }

      if (attendeeEmail) {
        event.attendees = [{ email: attendeeEmail }]
      }

      const response = await this.calendar!.events.insert({
        calendarId: this.config.GOOGLE_CALENDAR_ID,
        requestBody: event,
      })

      if (!response.data.id) {
        throw new ExternalServiceError("Failed to create calendar event - no event ID returned", "Google Calendar")
      }

      return response.data.id
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ExternalServiceError) {
        throw error
      }

      throw new ExternalServiceError("Failed to create calendar event", "Google Calendar", { originalError: error })
    }
  }

  /**
   * Update an existing calendar event
   * @param eventId - Google Calendar event ID
   * @param updates - Fields to update
   */
  async updateEvent(
    eventId: string,
    updates: {
      summary?: string
      description?: string
      startTime?: string
      endTime?: string
      status?: string
    },
  ): Promise<void> {
    try {
      this.validateCalendarClient()

      if (!eventId) {
        throw new ValidationError("Event ID is required")
      }

      const event: calendar_v3.Schema$Event = {}

      if (updates.summary) event.summary = updates.summary
      if (updates.description) event.description = updates.description
      if (updates.startTime) {
        event.start = {
          dateTime: updates.startTime,
          timeZone: "UTC",
        }
      }
      if (updates.endTime) {
        event.end = {
          dateTime: updates.endTime,
          timeZone: "UTC",
        }
      }
      if (updates.status) event.status = updates.status

      await this.calendar!.events.patch({
        calendarId: this.config.GOOGLE_CALENDAR_ID,
        eventId,
        requestBody: event,
      })
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }

      // Check if it's a 404 error
      if ((error as any)?.response?.status === 404) {
        throw new NotFoundError(`Calendar event not found: ${eventId}`)
      }

      throw new ExternalServiceError("Failed to update calendar event", "Google Calendar", { originalError: error })
    }
  }

  /**
   * Delete a calendar event
   * @param eventId - Google Calendar event ID
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      this.validateCalendarClient()

      if (!eventId) {
        throw new ValidationError("Event ID is required")
      }

      await this.calendar!.events.delete({
        calendarId: this.config.GOOGLE_CALENDAR_ID,
        eventId,
      })
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }

      // Check if it's a 404 error
      if ((error as any)?.response?.status === 404) {
        throw new NotFoundError(`Calendar event not found: ${eventId}`)
      }

      throw new ExternalServiceError("Failed to delete calendar event", "Google Calendar", { originalError: error })
    }
  }

  /**
   * Get a specific calendar event
   * @param eventId - Google Calendar event ID
   * @returns Calendar event details
   */
  async getEvent(eventId: string): Promise<calendar_v3.Schema$Event> {
    try {
      this.validateCalendarClient()

      if (!eventId) {
        throw new ValidationError("Event ID is required")
      }

      const response = await this.calendar!.events.get({
        calendarId: this.config.GOOGLE_CALENDAR_ID,
        eventId,
      })

      return response.data
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error
      }

      // Check if it's a 404 error
      if ((error as any)?.response?.status === 404) {
        throw new NotFoundError(`Calendar event not found: ${eventId}`)
      }

      throw new ExternalServiceError("Failed to get calendar event", "Google Calendar", { originalError: error })
    }
  }
}

// Export a singleton instance
export const googleCalendarClient = new GoogleCalendarClient()
