import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Trash } from "lucide-react"

export default function VehicleDetailPage({
  params,
}: {
  params: { tenantId: string; vehicleId: string }
}) {
  const { tenantId, vehicleId } = params

  // In a real implementation, you would fetch this data from your backend
  const vehicle = {
    id: vehicleId,
    name: "Toyota Camry",
    make: "Toyota",
    model: "Camry",
    year: 2020,
    licensePlate: "ABC123",
    vin: "1HGBH41JXMN109186",
    status: "Active",
    lastAssessment: "May 15, 2023",
    nextAssessment: "November 15, 2023",
    assessmentHistory: [
      { id: "1", date: "May 15, 2023", type: "Full Inspection", result: "Passed" },
      { id: "2", date: "November 10, 2022", type: "Full Inspection", result: "Passed" },
      { id: "3", date: "May 12, 2022", type: "Full Inspection", result: "Failed - Minor Issues" },
    ],
    bookingHistory: [
      { id: "1", date: "May 15, 2023", service: "Regular Maintenance", status: "Completed" },
      { id: "2", date: "November 10, 2022", service: "Tire Replacement", status: "Completed" },
      { id: "3", date: "June 5, 2022", service: "Oil Change", status: "Completed" },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link href={`/${tenantId}/dashboard/vehicles`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{vehicle.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${tenantId}/dashboard/vehicles/${vehicleId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Details</CardTitle>
            <CardDescription>Basic information about this vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Make</dt>
                <dd className="text-sm font-semibold">{vehicle.make}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Model</dt>
                <dd className="text-sm font-semibold">{vehicle.model}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Year</dt>
                <dd className="text-sm font-semibold">{vehicle.year}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">License Plate</dt>
                <dd className="text-sm font-semibold">{vehicle.licensePlate}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">VIN</dt>
                <dd className="text-sm font-semibold">{vehicle.vin}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="text-sm font-semibold">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      vehicle.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : vehicle.status === "Maintenance"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Last Assessment</dt>
                <dd className="text-sm font-semibold">{vehicle.lastAssessment}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Next Assessment</dt>
                <dd className="text-sm font-semibold">{vehicle.nextAssessment}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common actions for this vehicle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" asChild>
              <Link href={`/${tenantId}/dashboard/assessments/new?vehicleId=${vehicleId}`}>
                Schedule New Assessment
              </Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href={`/${tenantId}/dashboard/bookings/new?vehicleId=${vehicleId}`}>Book Service</Link>
            </Button>
            <Button className="w-full" variant="outline">
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assessments">
        <TabsList>
          <TabsTrigger value="assessments">Assessment History</TabsTrigger>
          <TabsTrigger value="bookings">Booking History</TabsTrigger>
        </TabsList>
        <TabsContent value="assessments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
              <CardDescription>Past assessments for this vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicle.assessmentHistory.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>{assessment.date}</TableCell>
                        <TableCell>{assessment.type}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              assessment.result.includes("Passed")
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {assessment.result}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
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
        <TabsContent value="bookings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>Past bookings for this vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicle.bookingHistory.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.date}</TableCell>
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
                          <Button variant="ghost" size="sm">
                            View
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
      </Tabs>
    </div>
  )
}

// Import the Table components to avoid errors
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
