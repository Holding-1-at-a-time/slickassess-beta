/**
 * Unit tests for GoogleCalendarClient
 */

import { GoogleCalendarClient } from "../googleCalendarClient"
import { google } from "googleapis"
import { ValidationError, ExternalServiceError, NotFoundError } from "../errors"

// Mock the googleapis module
jest.mock("googleapis")
jest.mock("../env-validator", () => ({
  getConfig: () => ({
    GOOGLE_SERVICE_ACCOUNT_EMAIL: "test@example.com",
    GOOGLE_PRIVATE_KEY: "test-key",
    GOOGLE_CALENDAR_ID: "test-calendar@example.com",
    NEXT_PUBLIC_CONVEX_URL: "https://test.convex.cloud",
    TOGETHER_API_KEY: "test-key",
  }),
}))

describe("GoogleCalendarClient", () => {
  let client: GoogleCalendarClient
  let mockCalendar: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup mock calendar
    mockCalendar = {
      events: {
        insert: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        get: jest.fn(),
      },
      freebusy: {
        query: jest.fn(),
      },
    }

    // Mock google.auth.JWT
    ;(google.auth as any).JWT = jest.fn().mockImplementation(() => ({}))

    // Mock google.calendar
    ;(google.calendar as any) = jest.fn().mockReturnValue(mockCalendar)

    // Create client instance
    client = new GoogleCalendarClient()
  })

  describe("getAvailableSlots", () => {
    it("should return available slots successfully", async () => {
      // Mock freebusy response
      mockCalendar.freebusy.query.mockResolvedValue({
        data: {
          calendars: {
            "test-calendar@example.com": {
              busy: [{ start: "2024-01-01T10:00:00Z", end: "2024-01-01T11:00:00Z" }],
            },
          },
        },
      })

      const slots = await client.getAvailableSlots("2024-01-01T00:00:00Z", "2024-01-02T00:00:00Z", 60)

      expect(slots).toBeDefined()
      expect(Array.isArray(slots)).toBe(true)
      expect(mockCalendar.freebusy.query).toHaveBeenCalled()
    })

    it("should throw ValidationError for invalid date range", async () => {
      await expect(client.getAvailableSlots("2024-01-02T00:00:00Z", "2024-01-01T00:00:00Z", 60)).rejects.toThrow(
        ValidationError,
      )
    })

    it("should throw ValidationError for invalid duration", async () => {
      await expect(
        client.getAvailableSlots(
          "2024-01-01T00:00:00Z",
          "2024-01-02T00:00:00Z",
          10, // Too short
        ),
      ).rejects.toThrow(ValidationError)
    })

    it("should handle external service errors", async () => {
      mockCalendar.freebusy.query.mockRejectedValue(new Error("API Error"))

      await expect(client.getAvailableSlots("2024-01-01T00:00:00Z", "2024-01-02T00:00:00Z", 60)).rejects.toThrow(
        ExternalServiceError,
      )
    })
  })

  describe("createEvent", () => {
    it("should create an event successfully", async () => {
      mockCalendar.events.insert.mockResolvedValue({
        data: { id: "event-123" },
      })

      const eventId = await client.createEvent(
        "Test Event",
        "Test Description",
        "2024-01-01T10:00:00Z",
        "2024-01-01T11:00:00Z",
        "attendee@example.com",
      )

      expect(eventId).toBe("event-123")
      expect(mockCalendar.events.insert).toHaveBeenCalledWith({
        calendarId: "test-calendar@example.com",
        requestBody: expect.objectContaining({
          summary: "Test Event",
          description: "Test Description",
          attendees: [{ email: "attendee@example.com" }],
        }),
      })
    })

    it("should throw ValidationError for missing required fields", async () => {
      await expect(client.createEvent("", "", "", "")).rejects.toThrow(ValidationError)
    })

    it("should handle API errors", async () => {
      mockCalendar.events.insert.mockRejectedValue(new Error("API Error"))

      await expect(
        client.createEvent("Test Event", "Test Description", "2024-01-01T10:00:00Z", "2024-01-01T11:00:00Z"),
      ).rejects.toThrow(ExternalServiceError)
    })
  })

  describe("updateEvent", () => {
    it("should update an event successfully", async () => {
      mockCalendar.events.patch.mockResolvedValue({ data: {} })

      await client.updateEvent("event-123", {
        summary: "Updated Event",
        startTime: "2024-01-01T11:00:00Z",
      })

      expect(mockCalendar.events.patch).toHaveBeenCalledWith({
        calendarId: "test-calendar@example.com",
        eventId: "event-123",
        requestBody: expect.objectContaining({
          summary: "Updated Event",
        }),
      })
    })

    it("should throw NotFoundError for non-existent event", async () => {
      mockCalendar.events.patch.mockRejectedValue({
        response: { status: 404 },
      })

      await expect(client.updateEvent("non-existent", { summary: "Test" })).rejects.toThrow(NotFoundError)
    })
  })

  describe("deleteEvent", () => {
    it("should delete an event successfully", async () => {
      mockCalendar.events.delete.mockResolvedValue({ data: {} })

      await client.deleteEvent("event-123")

      expect(mockCalendar.events.delete).toHaveBeenCalledWith({
        calendarId: "test-calendar@example.com",
        eventId: "event-123",
      })
    })

    it("should throw ValidationError for missing event ID", async () => {
      await expect(client.deleteEvent("")).rejects.toThrow(ValidationError)
    })
  })

  describe("getEvent", () => {
    it("should get an event successfully", async () => {
      const mockEvent = {
        id: "event-123",
        summary: "Test Event",
      }

      mockCalendar.events.get.mockResolvedValue({
        data: mockEvent,
      })

      const event = await client.getEvent("event-123")

      expect(event).toEqual(mockEvent)
      expect(mockCalendar.events.get).toHaveBeenCalledWith({
        calendarId: "test-calendar@example.com",
        eventId: "event-123",
      })
    })

    it("should throw NotFoundError for non-existent event", async () => {
      mockCalendar.events.get.mockRejectedValue({
        response: { status: 404 },
      })

      await expect(client.getEvent("non-existent")).rejects.toThrow(NotFoundError)
    })
  })
})
