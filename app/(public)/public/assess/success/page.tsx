"use client"

import { useSearchParams } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle } from "lucide-react"

export default function AssessmentSuccessPage() {
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get("id")

  // Get assessment details if ID is provided
  const assessment = useQuery(
    api.assessments.getAssessmentById,
    assessmentId
      ? {
          assessmentId,
          tenantId: "public", // Special case for public view
        }
      : null,
  )

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Assessment Submitted</CardTitle>
          <CardDescription>Thank you for completing your vehicle assessment</CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          {assessment ? (
            <div className="space-y-4">
              <p>
                Your assessment has been received and is being processed. Our team will review the information and
                images you provided.
              </p>
              {assessment.estimatedPrice && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold">Preliminary Estimate</p>
                  <p className="text-2xl font-bold">${assessment.estimatedPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    This is an initial estimate based on your assessment. The final price may vary after our team's
                    review.
                  </p>
                </div>
              )}
            </div>
          ) : assessmentId ? (
            <div className="flex justify-center items-center py-4">
              <Spinner size="md" />
              <span className="ml-2">Loading assessment details...</span>
            </div>
          ) : (
            <p>Your assessment has been submitted successfully. You will be contacted shortly with next steps.</p>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button onClick={() => window.close()} className="w-full">
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
