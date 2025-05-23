import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"

export default function AssessmentsPage({ params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId

  // In a real implementation, you would fetch this data from your backend
  const assessments = [
    {
      id: "1",
      vehicleName: "Toyota Camry",
      vehicleId: "1",
      date: "May 15, 2023",
      type: "Full Inspection",
      status: "Completed",
      result: "Passed",
    },
    {
      id: "2",
      vehicleName: "Honda Accord",
      vehicleId: "2",
      date: "May 10, 2023",
      type: "Quick Check",
      status: "Completed",
      result: "Passed",
    },
    {
      id: "3",
      vehicleName: "Ford F-150",
      vehicleId: "3",
      date: "May 5, 2023",
      type: "Full Inspection",
      status: "Completed",
      result: "Failed - Minor Issues",
    },
    {
      id: "4",
      vehicleName: "Chevrolet Malibu",
      vehicleId: "4",
      date: "June 1, 2023",
      type: "Full Inspection",
      status: "Scheduled",
      result: "Pending",
    },
    {
      id: "5",
      vehicleName: "Nissan Altima",
      vehicleId: "5",
      date: "June 5, 2023",
      type: "Quick Check",
      status: "Scheduled",
      result: "Pending",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        <Button asChild>
          <Link href={`/${tenantId}/dashboard/assessments/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Assessment
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Assessments</CardTitle>
          <CardDescription>View and manage all vehicle assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search assessments..." className="w-full pl-8" />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/${tenantId}/dashboard/vehicles/${assessment.vehicleId}`}
                        className="hover:underline"
                      >
                        {assessment.vehicleName}
                      </Link>
                    </TableCell>
                    <TableCell>{assessment.date}</TableCell>
                    <TableCell>{assessment.type}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          assessment.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : assessment.status === "Scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {assessment.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          assessment.result === "Passed"
                            ? "bg-green-100 text-green-800"
                            : assessment.result === "Pending"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {assessment.result}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/${tenantId}/dashboard/assessments/${assessment.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
