"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="mt-2 text-gray-600">{error.message || "An unexpected error occurred"}</p>
        <Button onClick={() => reset()} className="mt-4">
          Try again
        </Button>
      </div>
    </div>
  )
}
