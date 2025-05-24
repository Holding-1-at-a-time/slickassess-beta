"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle, ArrowRight } from "lucide-react"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const assessmentId = searchParams.get("id")
  const [estimateReady, setEstimateReady] = useState(false)

  // Get assessment data
  const assessment = useQuery(
    api.assessments.getAssessmentById,
    assessmentId
      ? {
          assessmentId,
          includeEstimate: true,
        }
      : "skip",
  )

  // Poll for estimate readiness
  useEffect(() => {
    if (assessment?.estimatedPrice) {
      setEstimateReady(true)
    }

    // If no estimate yet, poll every 3 seconds
    if (assessment && !assessment.estimatedPrice) {
      const timer = setTimeout(() => {
        // This will trigger a re-fetch of the assessment
        setEstimateReady(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [assessment])

  if (!assessmentId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Request</CardTitle>
            <CardDescription>No assessment ID provided.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/")} className="w-full">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" />
        <span className="ml-2">Loading assessment details...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Assessment Submitted Successfully</CardTitle>
          <CardDescription>Thank you for completing your vehicle assessment.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-medium">Assessment Details</h3>
            <p>
              <span className="font-semibold">Assessment ID:</span> {assessment._id}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {assessment.status || "Pending"}
            </p>
            <p>
              <span className="font-semibold">Submitted:</span> {new Date(assessment.createdAt).toLocaleString()}
            </p>
          </div>

          {estimateReady ? (
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="mb-2 font-medium">Preliminary Estimate</h3>
              <p className="text-2xl font-bold text-blue-700">
                ${assessment.estimatedPrice?.toFixed(2) || "Calculating..."}
              </p>
              <p className="text-sm text-gray-600">Estimated duration: {assessment.estimatedDuration} minutes</p>
              <p className="mt-2 text-sm text-gray-600">
                This is a preliminary estimate based on your assessment. The final price may vary based on a detailed
                inspection.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg bg-gray-100 p-6">
              <Spinner size="sm" className="mr-2" />
              <span>Calculating estimate...</span>
            </div>
          )}

          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-medium">Next Steps</h3>
            <p className="text-gray-600">
              Our team will review your assessment and contact you shortly to schedule your service appointment.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/")} className="flex items-center">
            Return to Home
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
