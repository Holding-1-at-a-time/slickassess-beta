"use client"

import { useState } from "react"
import { useVehicleAnalysis } from "@/hooks/useVehicleAnalysis"
import type { AIAnalysisItem, AIAnalysisResult } from "@/lib/types/ai-responses"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { FileUploader } from "@/components/FileUploader"

interface VehicleAnalysisViewerProps {
  tenantId: string
  onAnalysisComplete?: (result: AIAnalysisResult) => void
}

export function VehicleAnalysisViewer({ tenantId, onAnalysisComplete }: VehicleAnalysisViewerProps) {
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [vehicleInfo, setVehicleInfo] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    type: "Sedan",
  })

  const { analyzeVehicle, isAnalyzing, progress, message, analysisSteps, result, error } = useVehicleAnalysis({
    tenantId,
    onComplete: onAnalysisComplete,
  })

  const handleImageUpload = (urls: string[]) => {
    setUploadedImageUrls(urls)
  }

  const handleAnalyze = async () => {
    if (uploadedImageUrls.length === 0) return
    await analyzeVehicle(uploadedImageUrls, vehicleInfo)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor":
        return "bg-yellow-100 text-yellow-800"
      case "moderate":
        return "bg-orange-100 text-orange-800"
      case "severe":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Analysis</CardTitle>
          <CardDescription>Upload vehicle images for AI-powered damage assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FileUploader maxFiles={5} onUploadComplete={handleImageUpload} accept="image/*" disabled={isAnalyzing} />

            {uploadedImageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                {uploadedImageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Vehicle image ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAnalyze} disabled={uploadedImageUrls.length === 0 || isAnalyzing} className="w-full">
            {isAnalyzing ? (
              <span className="flex items-center">
                <Spinner className="mr-2" /> Analyzing...
              </span>
            ) : (
              "Analyze Vehicle"
            )}
          </Button>
        </CardFooter>
      </Card>

      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis in Progress</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />

            <div className="mt-6 space-y-4">
              {analysisSteps.map((step, index) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">
                      Step {step.step.step}: {step.step.message}
                    </h4>
                    <Badge variant={step.step.status === "complete" ? "default" : "outline"}>{step.step.status}</Badge>
                  </div>

                  {step.step.items && step.step.items.length > 0 && (
                    <ul className="mt-2 space-y-2">
                      {step.step.items.map((item: AIAnalysisItem) => (
                        <li key={item.id} className="text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs mr-2 ${getSeverityColor(item.severity)}`}
                          >
                            {item.severity}
                          </span>
                          <span className="font-medium">{item.location}:</span> {item.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Analysis Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Overall condition: <Badge>{result.overallCondition}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="issues">Issues ({result.detectedItems.length})</TabsTrigger>
                <TabsTrigger value="costs">Cost Estimate</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4 space-y-4">
                <p>{result.summary}</p>

                {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {result.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="issues" className="mt-4">
                <div className="space-y-4">
                  {result.detectedItems.map((item) => (
                    <div key={item.id} className="border rounded-md p-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{item.location}</h4>
                        <Badge className={getSeverityColor(item.severity)}>{item.severity}</Badge>
                      </div>
                      <p className="mt-1 text-sm">{item.description}</p>
                      {item.estimatedCost && (
                        <p className="mt-2 text-sm">
                          Estimated cost: {item.estimatedCost.currency} {item.estimatedCost.min} -{" "}
                          {item.estimatedCost.max}
                        </p>
                      )}
                      {item.suggestedAction && (
                        <p className="mt-1 text-sm font-medium">Suggested action: {item.suggestedAction}</p>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="costs" className="mt-4">
                {result.estimatedTotalCost ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Total Estimated Cost</h4>
                      <p className="text-2xl font-bold">
                        {result.estimatedTotalCost.currency} {result.estimatedTotalCost.min} -{" "}
                        {result.estimatedTotalCost.max}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Breakdown</h4>
                      <ul className="space-y-2">
                        {result.detectedItems.map((item) => (
                          <li key={item.id} className="flex justify-between border-b pb-2">
                            <span>
                              {item.location} ({item.severity})
                            </span>
                            {item.estimatedCost && (
                              <span>
                                {item.estimatedCost.currency} {item.estimatedCost.min} - {item.estimatedCost.max}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p>No cost estimate available</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline">Save Report</Button>
            <Button>Create Assessment</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
