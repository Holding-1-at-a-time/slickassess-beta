"use client"

import { useState, useEffect } from "react"
import { useChat } from "ai/react"
import { useConvex } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send } from "lucide-react"

interface BookingChatbotProps {
  tenantId: string
  vehicleId: string
  customerName: string
  customerEmail: string
}

interface TimeSlot {
  start: string
  end: string
  formatted: string
}

export function BookingChatbot({ tenantId, vehicleId, customerName, customerEmail }: BookingChatbotProps) {
  const convex = useConvex()
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Initialize the chat with a system prompt
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: `Hi ${customerName}! I'm your booking assistant. I can help you schedule a service for your vehicle. What type of service are you looking for today? (e.g., Regular Maintenance, Tire Replacement, Oil Change, etc.)`,
      },
    ],
  })

  // Process the chat messages to extract booking information
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]

    // Only process user messages
    if (lastMessage.role !== "user") return

    const userMessage = lastMessage.content.toLowerCase()

    // Step 1: Determine the service type
    if (!selectedService) {
      // Simple service type detection
      const serviceTypes = [
        "regular maintenance",
        "tire replacement",
        "oil change",
        "brake service",
        "inspection",
        "repair",
      ]

      const detectedService = serviceTypes.find((service) => userMessage.includes(service.toLowerCase()))

      if (detectedService) {
        setSelectedService(detectedService)

        // Ask for preferred date
        setTimeout(() => {
          append({
            role: "assistant",
            content: `Great! I'll help you book a ${detectedService}. What date would you prefer? (e.g., tomorrow, next Monday, June 15)`,
          })
        }, 500)
      } else {
        // If no service type detected, ask again
        setTimeout(() => {
          append({
            role: "assistant",
            content:
              "I'm not sure I understood the service type. Could you please specify what service you need? For example: Regular Maintenance, Tire Replacement, Oil Change, etc.",
          })
        }, 500)
      }
      return
    }

    // Step 2: Determine the preferred date
    if (selectedService && !selectedDate) {
      // Simple date detection
      const datePatterns = [
        { regex: /tomorrow/i, days: 1 },
        { regex: /next monday/i, day: 1 },
        { regex: /next tuesday/i, day: 2 },
        { regex: /next wednesday/i, day: 3 },
        { regex: /next thursday/i, day: 4 },
        { regex: /next friday/i, day: 5 },
        { regex: /next saturday/i, day: 6 },
        { regex: /next sunday/i, day: 0 },
      ]

      // Check for date patterns
      for (const pattern of datePatterns) {
        if (pattern.regex.test(userMessage)) {
          const date = new Date()

          if ("days" in pattern) {
            date.setDate(date.getDate() + pattern.days)
          } else if ("day" in pattern) {
            const currentDay = date.getDay()
            const daysToAdd = (7 - currentDay + pattern.day) % 7
            date.setDate(date.getDate() + daysToAdd)
          }

          setSelectedDate(date.toISOString().split("T")[0])
          setSelectedDuration(60) // Default duration: 60 minutes

          // Fetch available slots
          fetchAvailableSlots(date.toISOString().split("T")[0], 60)
          return
        }
      }

      // Check for specific date format (e.g., June 15)
      const dateMatch = userMessage.match(/(\w+)\s+(\d{1,2})(?:st|nd|rd|th)?/i)
      if (dateMatch) {
        const monthName = dateMatch[1]
        const day = Number.parseInt(dateMatch[2])

        const months = [
          "january",
          "february",
          "march",
          "april",
          "may",
          "june",
          "july",
          "august",
          "september",
          "october",
          "november",
          "december",
        ]

        const monthIndex = months.findIndex((m) => m.toLowerCase().startsWith(monthName.toLowerCase()))

        if (monthIndex !== -1 && day >= 1 && day <= 31) {
          const year = new Date().getFullYear()
          const date = new Date(year, monthIndex, day)

          // If the date is in the past, assume next year
          if (date < new Date()) {
            date.setFullYear(year + 1)
          }

          setSelectedDate(date.toISOString().split("T")[0])
          setSelectedDuration(60) // Default duration: 60 minutes

          // Fetch available slots
          fetchAvailableSlots(date.toISOString().split("T")[0], 60)
          return
        }
      }

      // If no date detected, ask again
      setTimeout(() => {
        append({
          role: "assistant",
          content:
            "I couldn't determine your preferred date. Could you please specify a date? For example: tomorrow, next Monday, June 15.",
        })
      }, 500)
      return
    }

    // Step 3: Handle slot selection
    if (selectedService && selectedDate && availableSlots.length > 0 && !selectedSlot) {
      // Check if the user message contains a time that matches one of our slots
      const selectedIndex = Number.parseInt(userMessage.match(/\d+/)?.[0] || "")

      if (!isNaN(selectedIndex) && selectedIndex >= 1 && selectedIndex <= availableSlots.length) {
        const slot = availableSlots[selectedIndex - 1]
        setSelectedSlot(slot)

        // Ask for confirmation
        setTimeout(() => {
          append({
            role: "assistant",
            content: `You've selected ${slot.formatted} for your ${selectedService}. Would you like to confirm this booking? (yes/no)`,
          })
        }, 500)
        return
      }

      // If no valid slot selected, ask again
      setTimeout(() => {
        append({
          role: "assistant",
          content:
            "I couldn't determine which time slot you want. Please select a slot by entering its number (e.g., 1, 2, 3).",
        })
      }, 500)
      return
    }

    // Step 4: Handle booking confirmation
    if (selectedService && selectedDate && selectedSlot && !bookingConfirmed) {
      if (userMessage.includes("yes") || userMessage.includes("confirm")) {
        // Create the booking
        createBooking()
      } else if (userMessage.includes("no") || userMessage.includes("cancel")) {
        // Reset slot selection
        setSelectedSlot(null)

        setTimeout(() => {
          append({
            role: "assistant",
            content: "No problem. Let's try again. Please select another time slot by entering its number.",
          })
        }, 500)
      } else {
        // If response is unclear, ask again
        setTimeout(() => {
          append({
            role: "assistant",
            content: `Would you like to confirm your booking for ${selectedService} on ${selectedSlot.formatted}? Please answer with yes or no.`,
          })
        }, 500)
      }
      return
    }
  }, [messages])

  // Fetch available slots from the server
  const fetchAvailableSlots = async (date: string, durationMinutes: number) => {
    setIsLoadingSlots(true)

    try {
      // Create start and end dates (start is the selected date, end is the next day)
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)

      // Call the Convex function to fetch available slots
      const slots = await convex.action(api.functions.fetchAvailableSlots, {
        tenantId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        durationMinutes,
        serviceType: selectedService || undefined,
      })

      // Format the slots for display
      const formattedSlots = slots.map((slot) => {
        const startTime = new Date(slot.start)
        const endTime = new Date(slot.end)

        return {
          start: slot.start,
          end: slot.end,
          formatted: `${formatTime(startTime)} - ${formatTime(endTime)}`,
        }
      })

      setAvailableSlots(formattedSlots)

      // Display available slots to the user
      setTimeout(() => {
        append({
          role: "assistant",
          content: `Great! Here are the available slots for ${formatDate(startDate)}:\n\n${
            formattedSlots.length > 0
              ? formattedSlots.map((slot, index) => `${index + 1}. ${slot.formatted}`).join("\n")
              : "Sorry, there are no available slots for this date. Please try another date."
          }\n\nPlease select a slot by entering its number.`,
        })
      }, 500)
    } catch (error) {
      console.error("Error fetching available slots:", error)

      setTimeout(() => {
        append({
          role: "assistant",
          content: "I'm sorry, there was an error fetching available time slots. Please try again later.",
        })
      }, 500)
    } finally {
      setIsLoadingSlots(false)
    }
  }

  // Create a booking in the system
  const createBooking = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) return

    try {
      // Call the Convex mutation to create the booking
      const result = await convex.mutation(api.functions.createBooking, {
        tenantId,
        vehicleId,
        customerName,
        customerEmail,
        serviceType: selectedService,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        notes: `Booked via chatbot`,
      })

      setBookingConfirmed(true)

      // Display confirmation to the user
      setTimeout(() => {
        append({
          role: "assistant",
          content: `Great! Your booking for ${selectedService} on ${selectedSlot.formatted} has been confirmed. You'll receive a confirmation email shortly with all the details. Is there anything else I can help you with?`,
        })
      }, 500)
    } catch (error) {
      console.error("Error creating booking:", error)

      setTimeout(() => {
        append({
          role: "assistant",
          content:
            "I'm sorry, there was an error creating your booking. Please try again later or contact our support team for assistance.",
        })
      }, 500)
    }
  }

  // Helper function to format time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Helper function to format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Book a Service</CardTitle>
        <CardDescription>Chat with our booking assistant to schedule your service</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8">
                    {message.role === "user" ? (
                      <AvatarFallback>{customerName.charAt(0)}</AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src="/bot-avatar.png" alt="Bot" />
                        <AvatarFallback>AI</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoadingSlots && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
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
            disabled={isLoading || isLoadingSlots}
          />
          <Button type="submit" size="icon" disabled={isLoading || isLoadingSlots}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
