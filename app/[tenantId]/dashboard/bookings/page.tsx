import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus } from "lucide-react"
import { BookingCalendar } from "@/components/BookingCalendar"

export default function BookingsPage({ params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId

  // In a real implementation, you would fetch this data from your backend
  const bookings = [
    {
      id: "1",
      vehicleName: "Toyota Camry",
      vehicleId: "1",
      date: "June 15, 2023",
      time: "10:00 AM",
      service: "Regular Maintenance",
      status: "Scheduled",
    },
    {
      id: "2",
      vehicleName: "Honda Accord",
      vehicleId: "2",
      date: "June 17, 2023",
      time: "2:30 PM",
      service: "Tire Replacement",
      status: "Scheduled",
    },
    {
      id: "3",
      vehicleName: "Ford F-150",
      vehicleId: "3",
      date: "June 20, 2023",
      time: "9:15 AM",
      service: "Oil Change",
      status: "Scheduled",
    },
    {
      id: "4",
      vehicleName: "Toyota Camry",
      vehicleId: "1",
      date: "May 15, 2023",
      time: "11:00 AM",
      service: "Regular Maintenance",
      status: "Completed",
    },
    {
      id: "5",
      vehicleName: "Honda Accord",
      vehicleId: "2",
      date: "May 10, 2023",
      time: "3:00 PM",
      service: "Tire Rotation",
      status: "Completed",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <Button asChild>
          <Link href={`/${tenantId}/dashboard/bookings/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming & Past Bookings</CardTitle>
              <CardDescription>View and manage all vehicle service bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search bookings..." className="w-full pl-8" />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/${tenantId}/dashboard/vehicles/${booking.vehicleId}`}
                            className="hover:underline"
                          >
                            {booking.vehicleName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {booking.date} at {booking.time}
                        </TableCell>
                        <TableCell>{booking.service}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              booking.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "Scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/${tenantId}/dashboard/bookings/${booking.id}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <BookingCalendar tenantId={tenantId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
