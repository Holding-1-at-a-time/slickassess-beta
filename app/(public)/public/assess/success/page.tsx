"use client"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function AssessmentSuccessPage() {
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get("id")

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Assessment Submitted</CardTitle>
          <CardDescription>Thank you for completing the vehicle self-assessment.</CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          <p className="text-gray-700">
            Your assessment has been received and is being processed. A service representative will review your
            submission and contact you with next steps.
          </p>

          {assessmentId && <p className="mt-4 text-sm text-gray-500">Assessment ID: {assessmentId}</p>}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
