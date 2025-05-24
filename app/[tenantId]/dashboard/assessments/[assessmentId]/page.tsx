"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/use-toast"
import { EstimateTable } from "@/components/EstimateTable"
import { ArrowLeft, Calendar, Check, X, FileText } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

export default function AssessmentDetailPage() {
  const params = useParams<{ tenantId: string; assessmentId: string }>()
  const { tenantId, assessmentId } = params
  const router = useRouter()

  // State
  const [activeTab, setActiveTab] = useState<string>("summary")
  const [processing, setProcessing] = useState<boolean>(false)

  // Queries
  const assessment = useQuery(api.assessments.getAssessmentById, {
    tenantId,
    assessmentId,
  })

  const vehicle = useQuery(
    api.vehicles.getVehicleById,
    assessment?.vehicleId
      ? {
          tenantId,
          vehicleId: assessment.vehicleId,
        }
      : null,
  )

  // Mutations
  const approveAssessment = useMutation(api.assessments.approveAssessment)
  const rejectAssessment = useMutation(api.assessments.rejectAssessment)
  const recalculateEstimate = useMutation(api.assessments.calculateEstimate)

  // Handle approve assessment
  const handleApprove = async () => {
    setProcessing(true)
    try {
      await approveAssessment({
        tenantId,
        assessmentId,
      })
      toast({
        title: "Assessment approved",
        description: "The assessment has been approved successfully.",
      })
    } catch (error) {
      console.error("Error approving assessment:", error)
      toast({
        title: "Approval failed",
        description: "Failed to approve the assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  // Handle reject assessment
  const handleReject = async () => {
    setProcessing(true)
    try {
      await rejectAssessment({
        tenantId,
        assessmentId,
      })
      toast({
        title: "Assessment rejected",
        description: "The assessment has been rejected.",
      })
    } catch (error) {
      console.error("Error rejecting assessment:", error)
      toast({
        title: "Rejection failed",
        description: "Failed to reject the assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  // Handle recalculate estimate
  const handleRecalculateEstimate = async () => {
    setProcessing(true)
    try {
      await recalculateEstimate({
        tenantId,
        assessmentId,
      })
      toast({
        title: "Estimate recalculated",
        description: "The estimate has been recalculated successfully.",
      })
    } catch (error) {
      console.error("Error recalculating estimate:", error)
      toast({
        title: "Recalculation failed",
        description: "Failed to recalculate the estimate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>
      case "completed":
        return <Badge variant="default">Completed</Badge>
      case "approved":
        return <Badge variant="success">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Loading state
  if (!assessment) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
        <span className="ml-2">Loading assessment...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Assessment Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>
                    {vehicle
                      ? `${vehicle.year} ${vehicle.make} ${vehicle.model} ${
                          vehicle.licensePlate ? `(${vehicle.licensePlate})` : ""
                        }`
                      : "Vehicle Details"}
                  </CardTitle>
                  <CardDescription>
                    Created {formatDistanceToNow(new Date(assessment.createdAt), { addSuffix: true })}
                  </CardDescription>
                </div>
                {getStatusBadge(assessment.status || "pending")}
              </div>
            </CardHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="px-6">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="form">Form Data</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="ai">AI Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Assessment Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p>{getStatusBadge(assessment.status || "pending")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p>{format(new Date(assessment.createdAt), "PPP 'at' p")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p>{format(new Date(assessment.updatedAt), "PPP 'at' p")}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Images</p>
                        <p>{assessment.images?.length || 0} uploaded</p>
                      </div>
                    </div>
                  </div>

                  {assessment.aiAnalysis && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">AI Analysis Summary</h3>
                      <p className="mb-2">{assessment.aiAnalysis.summary}</p>
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">Detected Issues</p>
                        {assessment.aiAnalysis.detectedIssues.length === 0 ? (
                          <p>No issues detected</p>
                        ) : (
                          <ul className="list-disc list-inside space-y-1">
                            {assessment.aiAnalysis.detectedIssues.map((issue, index) => (
                              <li key={index}>
                                {issue.type} at {issue.location} (Severity: {issue.severity}/5)
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}

                  {assessment.estimatedPrice !== undefined && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Estimate</h3>
                      <p className="text-2xl font-bold">${assessment.estimatedPrice.toFixed(2)}</p>
                      {assessment.estimatedDuration && (
                        <p className="text-sm text-gray-500">
                          Estimated duration: {assessment.estimatedDuration} minutes
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRecalculateEstimate}
                        disabled={processing}
                        className="mt-2"
                      >
                        Recalculate Estimate
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="form" className="p-6">
                <div className="space-y-6">
                  {assessment.formData?.sections.map((section) => (
                    <div key={section.id} className="space-y-4">
                      <h3 className="text-lg font-medium">{section.title}</h3>
                      <div className="space-y-4">
                        {section.items.map((item) => (
                          <div key={item.id} className="space-y-1">
                            <p className="font-medium">{item.label}</p>
                            {item.type === "checkbox" && <p>{item.value === true ? "Yes" : "No"}</p>}
                            {item.type === "text" && <p>{item.value || "No response"}</p>}
                            {item.type === "select" && <p>{item.value || "No selection"}</p>}
                            {item.type === "photo" && <p>See Images tab</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="images" className="p-6">
                {!assessment.images || assessment.images.length === 0 ? (
                  <div className="text-center p-12 border border-dashed rounded-lg">
                    <p className="text-gray-500">No images uploaded for this assessment.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assessment.images.map((url, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Assessment image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="ai" className="p-6">
                {!assessment.aiAnalysis ? (
                  <div className="text-center p-12 border border-dashed rounded-lg">
                    <p className="text-gray-500">No AI analysis available for this assessment.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Analysis Summary</h3>
                      <p>{assessment.aiAnalysis.summary}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Detected Issues</h3>
                      {assessment.aiAnalysis.detectedIssues.length === 0 ? (
                        <p>No issues detected</p>
                      ) : (
                        <div className="space-y-4">
                          {assessment.aiAnalysis.detectedIssues.map((issue, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <p className="text-sm text-gray-500">Type</p>
                                    <p className="font-medium">{issue.type}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Location</p>
                                    <p>{issue.location}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Severity</p>
                                    <p>{issue.severity}/5</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Confidence</p>
                                    <p>{Math.round(issue.confidence * 100)}%</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assessment.status !== "approved" && assessment.status !== "rejected" && (
                <>
                  <Button
                    className="w-full"
                    onClick={handleApprove}
                    disabled={processing || !assessment.estimatedPrice}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve Assessment
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleReject} disabled={processing}>
                    <X className="mr-2 h-4 w-4" />
                    Reject Assessment
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/${tenantId}/dashboard/bookings/new?assessmentId=${assessmentId}`)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Service
              </Button>

              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          {assessment.estimatedPrice !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle>Estimate</CardTitle>
              </CardHeader>
              <CardContent>
                <EstimateTable
                  items={
                    assessment.aiAnalysis?.detectedIssues.map((issue) => ({
                      name: `${issue.type} (${issue.location})`,
                      price: (assessment.estimatedPrice || 0) / assessment.aiAnalysis.detectedIssues.length,
                    })) || []
                  }
                  total={assessment.estimatedPrice}
                />
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  Estimated duration: {assessment.estimatedDuration || "N/A"} minutes
                </p>
              </CardFooter>
            </Card>
          )}

          {vehicle && (
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Make</p>
                    <p>{vehicle.make}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Model</p>
                    <p>{vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p>{vehicle.year}</p>
                  </div>
                  {vehicle.licensePlate && (
                    <div>
                      <p className="text-sm text-gray-500">License Plate</p>
                      <p>{vehicle.licensePlate}</p>
                    </div>
                  )}
                  {vehicle.vin && (
                    <div>
                      <p className="text-sm text-gray-500">VIN</p>
                      <p>{vehicle.vin}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/${tenantId}/dashboard/vehicles/${vehicle._id}`)}
                >
                  View Vehicle Details
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
