import { google, type calendar_v3 } from "googleapis"
import { JWT } from "google-auth-library"

export interface CalendarSlot {
  start: Date
  end: Date
}

export interface BookingDetails {
  summary: string
  description: string
  startTime: Date
  endTime: Date
  attendeeEmail?: string
}

export class GoogleCalendarClient {
  private calendar: calendar_v3.Calendar
  private calendarId: string

  constructor(calendarId: string) {
    const credentials = {
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/calendar"],
    }

    const auth = new JWT(credentials)
    this.calendar = google.calendar({ version: "v3", auth })
    this.calendarId = calendarId
  }

  async getAvailableSlots(
    startDate: Date,
    endDate: Date,
    duration: number, // in minutes
  ): Promise<CalendarSlot[]> {
    try {
      // Get busy times from the calendar
      const busyTimesResponse = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: this.calendarId }],
        },
      })

      const busyTimes = busyTimesResponse.data.calendars?.[this.calendarId]?.busy || []

      // Generate all possible slots based on business hours
      const slots = this.generateTimeSlots(startDate, endDate, duration)

      // Filter out busy slots
      return this.filterAvailableSlots(slots, busyTimes, duration)
    } catch (error) {
      console.error("Error fetching available slots:", error)
      throw new Error("Failed to fetch available slots from Google Calendar")
    }
  }

  async createEvent(bookingDetails: BookingDetails): Promise<string> {
    try {
      const event = {
        summary: bookingDetails.summary,
        description: bookingDetails.description,
        start: {
          dateTime: bookingDetails.startTime.toISOString(),
        },
        end: {
          dateTime: bookingDetails.endTime.toISOString(),
        },
        attendees: bookingDetails.attendeeEmail ? [{ email: bookingDetails.attendeeEmail }] : undefined,
      }

      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: event,
      })

      return response.data.id || ""
    } catch (error) {
      console.error("Error creating calendar event:", error)
      throw new Error("Failed to create event in Google Calendar")
    }
  }

  async updateEvent(eventId: string, bookingDetails: Partial<BookingDetails>): Promise<void> {
    try {
      const event: any = {}

      if (bookingDetails.summary) event.summary = bookingDetails.summary
      if (bookingDetails.description) event.description = bookingDetails.description
      if (bookingDetails.startTime) event.start = { dateTime: bookingDetails.startTime.toISOString() }
      if (bookingDetails.endTime) event.end = { dateTime: bookingDetails.endTime.toISOString() }

      await this.calendar.events.patch({
        calendarId: this.calendarId,
        eventId: eventId,
        requestBody: event,
      })
    } catch (error) {
      console.error("Error updating calendar event:", error)
      throw new Error("Failed to update event in Google Calendar")
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId: eventId,
      })
    } catch (error) {
      console.error("Error deleting calendar event:", error)
      throw new Error("Failed to delete event from Google Calendar")
    }
  }

  private generateTimeSlots(startDate: Date, endDate: Date, duration: number): CalendarSlot[] {
    const slots: CalendarSlot[] = []
    const currentDate = new Date(startDate)

    // Business hours: 9 AM to 5 PM
    const businessStartHour = 9
    const businessEndHour = 17

    while (currentDate < endDate) {
      // Set to business start hour
      currentDate.setHours(businessStartHour, 0, 0, 0)

      // Generate slots for the day
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(businessEndHour, 0, 0, 0)

      while (currentDate < dayEnd) {
        const slotEnd = new Date(currentDate)
        slotEnd.setMinutes(currentDate.getMinutes() + duration)

        if (slotEnd <= dayEnd) {
          slots.push({
            start: new Date(currentDate),
            end: slotEnd,
          })
        }

        // Move to next slot
        currentDate.setMinutes(currentDate.getMinutes() + 30) // 30-minute increments
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
      currentDate.setHours(0, 0, 0, 0)
    }

    return slots
  }

  private filterAvailableSlots(
    slots: CalendarSlot[],
    busyTimes: Array<{ start: string; end: string }>,
    duration: number,
  ): CalendarSlot[] {
    return slots.filter((slot) => {
      // Check if the slot overlaps with any busy time
      return !busyTimes.some((busyTime) => {
        const busyStart = new Date(busyTime.start)
        const busyEnd = new Date(busyTime.end)

        // Check for overlap
        return (
          (slot.start >= busyStart && slot.start < busyEnd) || // Slot starts during busy time
          (slot.end > busyStart && slot.end <= busyEnd) || // Slot ends during busy time
          (slot.start <= busyStart && slot.end >= busyEnd) // Slot contains busy time
        )
      })
    })
  }
}
