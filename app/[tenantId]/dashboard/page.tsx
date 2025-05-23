import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Car, ClipboardCheck, Calendar, DollarSign } from "lucide-react"

export default function DashboardPage({ params }: { params: { tenantId: string } }) {
  const tenantId = params.tenantId

  // In a real implementation, you would fetch this data from your backend
  const stats = [
    { name: "Total Vehicles", value: "24", icon: Car, href: `/${tenantId}/dashboard/vehicles` },
    { name: "Pending Assessments", value: "12", icon: ClipboardCheck, href: `/${tenantId}/dashboard/assessments` },
    { name: "Upcoming Bookings", value: "8", icon: Calendar, href: `/${tenantId}/dashboard/bookings` },
    { name: "Monthly Revenue", value: "$4,200", icon: DollarSign, href: `/${tenantId}/dashboard/pricing` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href={`/${tenantId}/dashboard/assessments/new`}>New Assessment</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground pt-1">
                <Link href={stat.href} className="hover:underline">
                  View details →
                </Link>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
            <CardDescription>Your most recent vehicle assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">Vehicle Assessment #{i}</div>
                    <div className="text-sm text-muted-foreground">Completed on May {10 + i}, 2023</div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/${tenantId}/dashboard/assessments/${i}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Your scheduled bookings for the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">Booking #{i}</div>
                    <div className="text-sm text-muted-foreground">
                      May {20 + i}, 2023 at {9 + i}:00 AM
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/${tenantId}/dashboard/bookings/${i}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
