"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../convex/_generated/api"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// Set up the localizer for react-big-calendar
const localizer = momentLocalizer(moment)

interface BookingCalendarProps {
  tenantId: string
  onSelectBooking?: (bookingId: string) => void
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  status: string
  customerName: string
  serviceType: string
  vehicleId: string
  allDay?: boolean
}

export function BookingCalendar({ tenantId, onSelectBooking }: BookingCalendarProps) {
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">("week")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Fetch bookings from Convex
  const bookings = useQuery(api.queries.listBookings, { tenantId }) || []

  // Convert bookings to calendar events
  const events: CalendarEvent[] = bookings.map((booking) => ({
    id: booking._id,
    title: `${booking.serviceType} - ${booking.customerName}`,
    start: new Date(booking.startTime),
    end: new Date(booking.endTime),
    status: booking.status,
    customerName: booking.customerName,
    serviceType: booking.serviceType,
    vehicleId: booking.vehicleId,
  }))

  // Handle event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
    if (onSelectBooking) {
      onSelectBooking(event.id)
    }
  }

  // Get the event style based on status
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#3174ad" // Default blue

    switch (event.status) {
      case "confirmed":
        backgroundColor = "#10b981" // Green
        break
      case "pending":
        backgroundColor = "#f59e0b" // Yellow
        break
      case "canceled":
        backgroundColor = "#ef4444" // Red
        break
      case "completed":
        backgroundColor = "#6366f1" // Purple
        break
      case "no-show":
        backgroundColor = "#9ca3af" // Gray
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Booking Calendar</CardTitle>
            <CardDescription>View and manage all bookings</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={view} onValueChange={(value) => setView(value as any)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="agenda">Agenda</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
              Today
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            view={view}
            onView={(newView) => setView(newView as any)}
            date={selectedDate}
            onNavigate={setSelectedDate}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            formats={{
              timeGutterFormat: (date, culture, localizer) => localizer?.format(date, "h:mm a", culture),
              eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                `${localizer?.format(start, "h:mm a", culture)} - ${localizer?.format(end, "h:mm a", culture)}`,
            }}
          />
        </div>
      </CardContent>

      {/* Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>View and manage this booking</DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Service</Label>
                  <div className="font-medium">{selectedEvent.serviceType}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="font-medium capitalize">{selectedEvent.status}</div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Customer</Label>
                <div className="font-medium">{selectedEvent.customerName}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Start Time</Label>
                  <div className="font-medium">{moment(selectedEvent.start).format("MMM D, YYYY h:mm A")}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">End Time</Label>
                  <div className="font-medium">{moment(selectedEvent.end).format("MMM D, YYYY h:mm A")}</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <a href={`/${tenantId}/dashboard/bookings/${selectedEvent?.id}`}>View Details</a>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
