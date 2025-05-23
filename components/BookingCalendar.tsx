"use client"

import { useState } from "react"
import { Calendar, momentLocalizer, Views } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

// Set up the localizer
const localizer = momentLocalizer(moment)

interface BookingCalendarProps {
  tenantId: string
}

export function BookingCalendar({ tenantId }: BookingCalendarProps) {
  const [view, setView] = useState(Views.WEEK)
  const [date, setDate] = useState(new Date())

  // Fetch bookings for the current date range
  const startDate = moment(date).startOf("month").toISOString()
  const endDate = moment(date).endOf("month").toISOString()

  // Fetch bookings
  const queryResult = useQuery(api.queries.listBookingsByDateRange, {
    startDate,
    endDate,
    tenantId,
  })

  // Initialize bookings to empty array in case of errors or null queryResult
  const bookings = queryResult || []

  // Convert bookings to calendar events
  const events =
    bookings?.map((booking) => ({
      id: booking._id,
      title: booking.serviceType,
      start: new Date(booking.startTime),
      end: new Date(booking.endTime),
      status: booking.status,
      resource: booking,
    })) || []

  // Custom event styling based on status
  const eventStyleGetter = (event: any) => {
    const style = {
      backgroundColor: "#3174ad",
      borderRadius: "4px",
      color: "white",
      border: "none",
      display: "block",
    }

    if (event.status === "confirmed") {
      style.backgroundColor = "#10b981" // Green
    } else if (event.status === "pending") {
      style.backgroundColor = "#f59e0b" // Yellow
    } else if (event.status === "canceled") {
      style.backgroundColor = "#ef4444" // Red
    }

    return {
      style,
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Booking Calendar</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView(Views.DAY)}
            className={view === Views.DAY ? "bg-primary text-primary-foreground" : ""}
          >
            Day
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView(Views.WEEK)}
            className={view === Views.WEEK ? "bg-primary text-primary-foreground" : ""}
          >
            Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView(Views.MONTH)}
            className={view === Views.MONTH ? "bg-primary text-primary-foreground" : ""}
          >
            Month
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            eventPropGetter={eventStyleGetter}
            step={30}
            timeslots={2}
            defaultView={Views.WEEK}
            views={[Views.DAY, Views.WEEK, Views.MONTH]}
          />
        </div>
      </CardContent>
    </Card>
  )
}
