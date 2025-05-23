"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { BookingChatbot } from "@/components/BookingChatbot"
import { BookingCalendar } from "@/components/BookingCalendar"

export default function NewBookingPage() {
  const params = useParams()
  const tenantId = params.tenantId as string
  const [activeTab, setActiveTab] = useState("chatbot")

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href={`/${tenantId}/dashboard/bookings`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Booking</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="chatbot">AI Booking Assistant</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        <TabsContent value="chatbot" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Booking Assistant</CardTitle>
              <CardDescription>Chat with our AI assistant to schedule a new booking</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingChatbot tenantId={tenantId} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>View available slots and schedule a booking</CardDescription>
            </CardHeader>
            <CardContent>
              <BookingCalendar tenantId={tenantId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
