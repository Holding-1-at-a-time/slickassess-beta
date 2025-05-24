"use client"

import { useSearchParams } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AssessmentSuccessPage() {
  const searchParams = useSearchParams()
  const price = searchParams.get("price")
  const assessmentId = searchParams.get("id")

  // Format price display - only show $ when we have a numeric value
  const formatPrice = (priceValue: string | null) => {
    if (!priceValue || priceValue === "Calculating...") {
      return "Calculating..."
    }
    // Ensure it's a valid number before adding $
    const numericPrice = Number.parseFloat(priceValue)
    if (isNaN(numericPrice)) {
      return priceValue
    }
    return `$${numericPrice.toFixed(2)}`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">Thank you for completing your vehicle assessment.</p>

          {assessmentId && (
            <div className="bg-gray-100 p-3 rounded-md">
              <p className="text-sm text-gray-600">Assessment ID:</p>
              <p className="font-mono text-sm">{assessmentId}</p>
            </div>
          )}

          {price && (
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-gray-600">Estimated Price:</p>
              <p className="text-2xl font-bold text-blue-600">{formatPrice(price)}</p>
            </div>
          )}

          <p className="text-sm text-gray-500">
            You will receive a confirmation email with your assessment details shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
