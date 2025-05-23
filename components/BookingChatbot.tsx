"use client"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMutation, useAction } from "convex/react"
import { api } from "@/convex/_generated/api"

interface BookingChatbotProps {
  tenantId: string
  vehicleId: string
  customerId: string
}

export function BookingChatbot({ tenantId, vehicleId, customerId }: BookingChatbotProps) {
  const [selectedSlot, setSelectedSlot] = useState<{
    start: string
    end: string
    duration: number
  } | null>(null)

  const fetchAvailableSlots = useAction(api.functions.fetchAvailableSlots)
  const createBookingRecord = useMutation(api.functions.createBooking.createBookingRecord)
  const createCalendarEvent = useAction(api.functions.createBooking.createCalendarEvent)

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, append } = useChat({
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your booking assistant. What type of service would you like to schedule?",
      },
    ],
  })

  // Handle AI responses and extract booking information
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]

    if (lastMessage && lastMessage.role === "user") {
      // Process user message to extract booking information
      const userMessage = lastMessage.content.toLowerCase()

      if (userMessage.includes("book") || userMessage.includes("schedule") || userMessage.includes("appointment")) {
        // Extract service type
        let serviceType = ""
        if (userMessage.includes("maintenance")) serviceType = "Regular Maintenance"
        else if (userMessage.includes("oil")) serviceType = "Oil Change"
        else if (userMessage.includes("tire")) serviceType = "Tire Service"
        else if (userMessage.includes("inspection")) serviceType = "Vehicle Inspection"
        else serviceType = "Service Appointment"

        // Ask for preferred date if service type is identified
        if (serviceType) {
          append({
            role: "assistant",
            content: `Great! I'll help you schedule a ${serviceType}. When would you prefer to have this service? Please provide a date or day of the week.`,
          })
        }
      } else if (
        userMessage.includes("tomorrow") ||
        userMessage.includes("next week") ||
        userMessage.includes("monday") ||
        userMessage.includes("tuesday") ||
        userMessage.includes("wednesday") ||
        userMessage.includes("thursday") ||
        userMessage.includes("friday")
      ) {
        // Handle date selection
        const startDate = new Date()
        const endDate = new Date()

        if (userMessage.includes("tomorrow")) {
          startDate.setDate(startDate.getDate() + 1)
          endDate.setDate(endDate.getDate() + 1)
        } else if (userMessage.includes("next week")) {
          startDate.setDate(startDate.getDate() + 7)
          endDate.setDate(endDate.getDate() + 7)
        } else {
          // Handle specific days of the week
          const today = startDate.getDay() // 0 = Sunday, 1 = Monday, etc.
          let targetDay = 0

          if (userMessage.includes("monday")) targetDay = 1
          else if (userMessage.includes("tuesday")) targetDay = 2
          else if (userMessage.includes("wednesday")) targetDay = 3
          else if (userMessage.includes("thursday")) targetDay = 4
          else if (userMessage.includes("friday")) targetDay = 5

          // Calculate days to add
          let daysToAdd = (targetDay - today + 7) % 7
          if (daysToAdd === 0) daysToAdd = 7 // Next week if today

          startDate.setDate(startDate.getDate() + daysToAdd)
          endDate.setDate(endDate.getDate() + daysToAdd)
        }

        // Set hours to cover the full day
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)

        // Fetch available slots
        fetchAvailableSlots({
          tenantId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          duration: 60, // Default to 1 hour
        })
          .then((slots) => {
            if (slots && slots.length > 0) {
              const formattedSlots = slots
                .map((slot) => {
                  const start = new Date(slot.start)
                  return `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                })
                .join(", ")

              append({
                role: "assistant",
                content: `I found the following available time slots: ${formattedSlots}. Please select a time that works for you.`,
              })
            } else {
              append({
                role: "assistant",
                content: "I'm sorry, but there are no available slots on that day. Would you like to try another day?",
              })
            }
          })
          .catch((error) => {
            console.error("Error fetching slots:", error)
            append({
              role: "assistant",
              content:
                "I'm having trouble checking availability right now. Please try again later or contact us directly to schedule your appointment.",
            })
          })
      } else if (userMessage.includes(":")) {
        // User has selected a time
        // Extract the time from the message
        const timeMatch = userMessage.match(/(\d{1,2}):(\d{2})/)

        if (timeMatch) {
          const hour = Number.parseInt(timeMatch[1])
          const minute = Number.parseInt(timeMatch[2])

          // Create a date object for the selected time
          const selectedDate = new Date()
          selectedDate.setHours(hour, minute, 0, 0)

          // Calculate end time (1 hour later)
          const endTime = new Date(selectedDate)
          endTime.setHours(endTime.getHours() + 1)

          setSelectedSlot({
            start: selectedDate.toISOString(),
            end: endTime.toISOString(),
            duration: 60,
          })

          append({
            role: "assistant",
            content: `Great! I've reserved ${selectedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} for your appointment. Would you like to confirm this booking?`,
          })
        }
      } else if (userMessage.includes("confirm") || userMessage.includes("yes") || userMessage.includes("book it")) {
        // User confirms the booking
        if (selectedSlot) {
          // Create the booking record
          createBookingRecord({
            tenantId,
            vehicleId,
            customerId,
            serviceType: "Service Appointment", // This would be extracted from earlier conversation
            startTime: selectedSlot.start,
            endTime: selectedSlot.end,
            duration: selectedSlot.duration,
            notes: "Booked via chatbot",
          })
            .then((bookingId) => {
              // Create the calendar event
              return createCalendarEvent({
                bookingId,
                tenantId,
                vehicleId,
                serviceType: "Service Appointment",
                startTime: selectedSlot.start,
                endTime: selectedSlot.end,
                notes: "Booked via chatbot",
              })
            })
            .then(() => {
              append({
                role: "assistant",
                content:
                  "Your booking has been confirmed! You'll receive a confirmation email shortly. Is there anything else I can help you with?",
              })

              // Reset selected slot
              setSelectedSlot(null)
            })
            .catch((error) => {
              console.error("Error creating booking:", error)
              append({
                role: "assistant",
                content:
                  "I'm sorry, but there was an error creating your booking. Please try again or contact us directly.",
              })
            })
        } else {
          append({
            role: "assistant",
            content: "I don't have a time slot selected. Please select an available time slot first.",
          })
        }
      }
    }
  }, [
    messages,
    append,
    fetchAvailableSlots,
    tenantId,
    vehicleId,
    customerId,
    createBookingRecord,
    createCalendarEvent,
    selectedSlot,
  ])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Booking Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted">
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            value={input}
            onChange={handleInputChange}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
