"use client"

export default function EnvCheckPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Check</h1>
      <div className="space-y-2">
        <p>
          <strong>NEXT_PUBLIC_CONVEX_URL:</strong> {process.env.NEXT_PUBLIC_CONVEX_URL ? "✅ Set" : "❌ Not Set"}
        </p>
        <p className="text-sm text-gray-600">Make sure your environment variables are properly configured in Vercel.</p>
      </div>
    </div>
  )
}
