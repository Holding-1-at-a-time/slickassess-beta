"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { EstimateTable } from "@/components/EstimateTable"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import {
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Car,
  FileText,
  ImageIcon,
  BarChart,
  AlertTriangle,
} from "lucide-react"

export default function AssessmentDetailPage() {
  const params = useParams<{ tenantId: string; assessmentId: string }>()
  const { tenantId, assessmentId } = params
  const router = useRouter()

  // State
  const [activeTab, setActiveTab] = useState<string>("summary")
  const [processing, setProcessing] = useState<boolean>(false)

  // Queries
  const assessment = useQuery(api.assessments.getAssessmentById, {
    assessmentId,
    tenantId,
  })

  const vehicle = useQuery(
    api.vehicles.getVehicleById,
    assessment?.vehicleId
      ? {
          vehicleId: assessment.vehicleId,
          tenantId,
        }
      : undefined,
  )

  // Mutations
  const updateAssessment = useMutation(api.assessments.updateAssessment)
  const recalculateEstimate = useMutation(api.assessments.calculateEstimate)

  // Handle approve assessment
  const handleApprove = async () => {
    setProcessing(true)

    try {
      await updateAssessment({
        assessmentId,
        tenantId,
        updates: {
          status: "approved",
          updatedAt: Date.now(),
        },
      })

      toast({
        title: "Assessment Approved",
        description: "The assessment has been approved successfully.",
      })
    } catch (error) {
      console.error("Error approving assessment:", error)
      toast({
        title: "Approval Failed",
        description: "Failed to approve assessment. Please try again.",
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
      await updateAssessment({
        assessmentId,
        tenantId,
        updates: {
          status: "rejected",
          updatedAt: Date.now(),
        },
      })

      toast({
        title: "Assessment Rejected",
        description: "The assessment has been rejected.",
      })
    } catch (error) {
      console.error("Error rejecting assessment:", error)
      toast({
        title: "Rejection Failed",
        description: "Failed to reject assessment. Please try again.",
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
      const result = await recalculateEstimate({
        assessmentId,
        tenantId,
      })

      toast({
        title: "Estimate Recalculated",
        description: `New estimate: $${result.estimatedPrice.toFixed(2)}`,
      })
    } catch (error) {
      console.error("Error recalculating estimate:", error)
      toast({
        title: "Recalculation Failed",
        description: "Failed to recalculate estimate. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status?: string) => {
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
        return <Badge variant="outline">New</Badge>
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

  // Generate line items from AI analysis
  const lineItems =
    assessment.aiAnalysis?.detectedIssues.map((issue) => ({
      serviceName: `${issue.type} (${issue.location})`,
      price: issue.severity * 20, // Simplified pricing for display
    })) || []

  // Calculate total cost
  const totalCost = assessment.estimatedPrice || lineItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Assessment Details</h1>
          <p className="text-muted-foreground">
            {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Loading vehicle..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(assessment.status)}
          <Button variant="outline" onClick={() => router.push(`/${tenantId}/dashboard/assessments`)}>
            Back to Assessments
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="form">Form Data</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Information</CardTitle>
                <CardDescription>Basic details about this assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Created: {format(new Date(assessment.createdAt), "PPP 'at' p")}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Last Updated: {format(new Date(assessment.updatedAt), "PPP 'at' p")}</span>
                </div>
                <div className="flex items-center">
                  <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Vehicle: {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "Loading..."}</span>
                </div>
                {vehicle?.licensePlate && (
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>License Plate: {vehicle.licensePlate}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Images: {assessment.images?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estimate</CardTitle>
                <CardDescription>Pricing and duration estimate</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessment.estimatedPrice ? (
                  <>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Estimated Price: ${assessment.estimatedPrice.toFixed(2)}</span>
                    </div>
                    {assessment.estimatedDuration && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Estimated Duration: {assessment.estimatedDuration} minutes</span>
                      </div>
                    )}
                    <EstimateTable lineItems={lineItems} totalCost={totalCost} />
                  </>
                ) : (
                  <div className="flex items-center text-amber-500">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span>No estimate available yet</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleRecalculateEstimate}
                  disabled={processing || !assessment.aiAnalysis}
                >
                  {processing ? <Spinner size="sm" className="mr-2" /> : <BarChart className="h-4 w-4 mr-2" />}
                  Recalculate Estimate
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Manage this assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleApprove}
                    disabled={processing || assessment.status === "approved"}
                    className="flex-1"
                  >
                    {processing ? <Spinner size="sm" className="mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                    Approve Assessment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={processing || assessment.status === "rejected"}
                    className="flex-1"
                  >
                    {processing ? <Spinner size="sm" className="mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                    Reject Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>Form Data</CardTitle>
              <CardDescription>Customer-submitted assessment data</CardDescription>
            </CardHeader>
            <CardContent>
              {assessment.formData?.sections.map((section) => (
                <div key={section.id} className="mb-6">
                  <h3 className="text-lg font-medium mb-2">{section.title}</h3>
                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div key={item.id} className="border-b pb-2">
                        <p className="font-medium">{item.label}</p>
                        {item.type === "checkbox" && <p>{item.value === true ? "Yes" : "No"}</p>}
                        {item.type === "text" && <p>{item.value || "No response"}</p>}
                        {item.type === "select" && <p>{item.value || "No selection"}</p>}
                        {item.type === "photo" && <p>Photo field (images shown in Images tab)</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {(!assessment.formData || assessment.formData.sections.length === 0) && (
                <div className="text-center p-8 border border-dashed rounded-md">
                  <p className="text-muted-foreground">No form data available for this assessment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Images</CardTitle>
              <CardDescription>Images uploaded during the assessment</CardDescription>
            </CardHeader>
            <CardContent>
              {assessment.images && assessment.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assessment.images.map((imageUrl, index) => (
                    <div key={index} className="aspect-square relative overflow-hidden rounded-md border">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={`Assessment image ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-md">
                  <p className="text-muted-foreground">No images available for this assessment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-analysis">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>Automated damage detection results</CardDescription>
            </CardHeader>
            <CardContent>
              {assessment.aiAnalysis ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Summary</h3>
                    <p>{assessment.aiAnalysis.summary}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Detected Issues</h3>
                    {assessment.aiAnalysis.detectedIssues.length > 0 ? (
                      <div className="space-y-4">
                        {assessment.aiAnalysis.detectedIssues.map((issue, index) => (
                          <div key={index} className="border rounded-md p-4">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{issue.type}</h4>
                              <Badge variant={issue.severity > 3 ? "destructive" : "outline"}>
                                Severity: {issue.severity}/5
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">Location: {issue.location}</p>
                            <p className="text-sm text-muted-foreground">
                              Confidence: {Math.round(issue.confidence * 100)}%
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No issues detected by AI analysis.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-md">
                  <p className="text-muted-foreground">
                    No AI analysis available for this assessment. Analysis may still be in progress or no images were
                    provided.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
