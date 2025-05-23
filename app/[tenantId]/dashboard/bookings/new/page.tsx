"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { BookingChatbot } from "@/components/BookingChatbot"
import { BookingCalendar } from "@/components/BookingCalendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function NewBookingPage() {
  const params = useParams()
  const router = useRouter()
  const tenantId = params.tenantId as string
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("")

  // Fetch vehicles from Convex
  const vehicles = useQuery(api.queries.listVehicles, { tenantId }) || []

  // For demo purposes, we'll use a fixed customer ID
  const customerId = "customer-123"

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

      <Card>
        <CardHeader>
          <CardTitle>Schedule a Service</CardTitle>
          <CardDescription>Create a new booking for a vehicle service or assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Vehicle</label>
            <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} ({vehicle.licensePlate})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="chatbot">
            <TabsList className="mb-4">
              <TabsTrigger value="chatbot">Booking Assistant</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>

            <TabsContent value="chatbot">
              {selectedVehicleId ? (
                <BookingChatbot tenantId={tenantId} vehicleId={selectedVehicleId} customerId={customerId} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">Please select a vehicle to continue</div>
              )}
            </TabsContent>

            <TabsContent value="calendar">
              <BookingCalendar tenantId={tenantId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
