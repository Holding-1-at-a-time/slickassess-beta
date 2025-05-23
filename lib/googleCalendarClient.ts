import { google, type calendar_v3 } from "googleapis"

export class GoogleCalendarClient {
  private calendar: calendar_v3.Calendar | null = null

  constructor() {
    try {
      // Validate required environment variables
      const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
      const privateKey = process.env.GOOGLE_PRIVATE_KEY
      const calendarId = process.env.GOOGLE_CALENDAR_ID

      if (!email || !privateKey || !calendarId) {
        console.error("Missing required Google Calendar environment variables")
        return
      }

      // Create auth client
      const auth = new google.auth.JWT({
        email,
        key: privateKey.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/calendar"],
      })

      this.calendar = google.calendar({ version: "v3", auth })
    } catch (error) {
      console.error("Error initializing Google Calendar client:", error)
      // Don't expose the actual error details which might contain sensitive info
    }
  }

  private validateCalendarClient() {
    if (!this.calendar) {
      throw new Error("Google Calendar client not initialized properly")
    }
  }

  async getAvailableSlots(
    startDate: string,
    endDate: string,
    duration: number, // in minutes
  ): Promise<{ startTime: string; endTime: string }[]> {
    try {
      this.validateCalendarClient()

      // Get busy times from calendar
      const busyTimes = await this.getBusyTimes(startDate, endDate)

      // Generate available time slots based on business hours and busy times
      return this.generateAvailableSlots(startDate, endDate, duration, busyTimes);

    } catch (error) {
      console.error("Error fetching available slots:", error)
      // Return empty array instead of throwing to prevent service disruption
      return []
    }
  }

  private async getBusyTimes(startDate: string, endDate: string): Promise<{ start: string; end: string }[]> {
    try {
      this.validateCalendarClient()

      const calendarId = process.env.GOOGLE_CALENDAR_ID
      if (!calendarId) {
        throw new Error("Missing GOOGLE_CALENDAR_ID environment variable")
      }

      const response = await this.calendar!.freebusy.query({
        requestBody: {
          timeMin: startDate,
          timeMax: endDate,
          items: [{ id: calendarId }],
        },
      })

      const busyTimes = response.data.calendars?.[calendarId]?.busy || []
      return busyTimes.map((time) => ({
        start: time.start || "",
        end: time.end || "",
      }))
    } catch (error) {
      console.error("Error fetching busy times:", error)
      return []
    }
  }

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
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        // Skip weekends
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

  async createEvent(
    summary: string,
    description: string,
    startTime: string,
    endTime: string,
    attendeeEmail?: string,
  ): Promise<string> {
    try {
      this.validateCalendarClient()

      const calendarId = process.env.GOOGLE_CALENDAR_ID
      if (!calendarId) {
        throw new Error("Missing GOOGLE_CALENDAR_ID environment variable")
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
        calendarId,
        requestBody: event,
      })

      return response.data.id || ""
    } catch (error) {
      console.error("Error creating event:", error)
      throw new Error("Failed to create calendar event")
    }
  }

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

      const calendarId = process.env.GOOGLE_CALENDAR_ID
      if (!calendarId) {
        throw new Error("Missing GOOGLE_CALENDAR_ID environment variable")
      }

      const event: calendar_v3.Schema$Event = {}

      if (updates.summary) {
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
        calendarId,
        eventId,
        requestBody: event,
      })
    } catch (error) {
      console.error("Error updating event:", error)
      throw new Error("Failed to update calendar event")
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      this.validateCalendarClient()

      const calendarId = process.env.GOOGLE_CALENDAR_ID
      if (!calendarId) {
        throw new Error("Missing GOOGLE_CALENDAR_ID environment variable")
      }

      await this.calendar!.events.delete({
        calendarId,
        eventId,
      })
    } catch (error) {
      console.error("Error deleting event:", error)
      throw new Error("Failed to delete calendar event")
    }
  }

  async watchCalendar(
    channelId: string,
    address: string,
    expiration?: string,
  ): Promise<{ resourceId: string; expiration: string }> {
    try {
      const response = await this.calendar.events.watch({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        requestBody: {
          id: channelId,
          type: "web_hook",
          address,
          expiration,
        },
      })

      return {
        resourceId: response.data.resourceId || "",
        expiration: response.data.expiration || "",
      }
    } catch (error) {
      console.error("Error setting up calendar watch:", error)
      throw error
    }
  }

  async stopWatch(channelId: string, resourceId: string): Promise<void> {
    try {
      await this.calendar.channels.stop({
        requestBody: {
          id: channelId,
          resourceId,
        },
      })
    } catch (error) {
      console.error("Error stopping calendar watch:", error)
      throw error
    }
  }

  async getEvent(eventId: string): Promise<calendar_v3.Schema$Event> {
    try {
      this.validateCalendarClient()

      const calendarId = process.env.GOOGLE_CALENDAR_ID
      if (!calendarId) {
        throw new Error("Missing GOOGLE_CALENDAR_ID environment variable")
      }

      const response = await this.calendar!.events.get({
        calendarId,
        eventId,
      })

      return response.data
    } catch (error) {
      console.error("Error getting event:", error)
      throw new Error("Failed to get calendar event")
    }
  }
}

// Export a singleton instance
export const googleCalendarClient = new GoogleCalendarClient()
