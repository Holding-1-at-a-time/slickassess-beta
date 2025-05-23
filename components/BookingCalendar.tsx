"use client"

import { useState, useEffect } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

// Set up the localizer
const localizer = momentLocalizer(moment)

interface BookingCalendarProps {
  tenantId: string
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  status: "confirmed" | "pending" | "canceled" | "completed"
}

export function BookingCalendar({ tenantId }: BookingCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])

  // Fetch bookings from Convex
  const bookings = useQuery(api.queries.listBookings, { tenantId })

  // Convert bookings to calendar events
  useEffect(() => {
    if (bookings) {
      const calendarEvents = bookings.map((booking) => ({
        id: booking._id.toString(),
        title: booking.serviceType,
        start: new Date(booking.startTime),
        end: new Date(booking.endTime),
        status: booking.status,
      }))

      setEvents(calendarEvents)
    }
  }, [bookings])

  // Custom event styling based on status
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#3174ad" // Default blue

    switch (event.status) {
      case "confirmed":
        backgroundColor = "#4caf50" // Green
        break
      case "pending":
        backgroundColor = "#ff9800" // Orange
        break
      case "canceled":
        backgroundColor = "#f44336" // Red
        break
      case "completed":
        backgroundColor = "#9e9e9e" // Gray
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0",
        display: "block",
      },
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Booking Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            eventPropGetter={eventStyleGetter}
            views={["month", "week", "day", "agenda"]}
            defaultView="week"
          />
        </div>
      </CardContent>
    </Card>
  )
}
