"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/use-toast"
import { FileUploader } from "@/components/FileUploader"

interface AssessmentPageProps {
  params: {
    token: string
  }
}

export default function AssessmentPage({ params }: AssessmentPageProps) {
  const { token } = params
  const router = useRouter()

  // State for form data
  const [formData, setFormData] = useState<{
    sections: Array<{
      id: string
      title: string
      items: Array<{
        id: string
        type: string
        label: string
        value?: any
        options?: string[]
      }>
    }>
  }>({ sections: [] })

  // State for uploaded images
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploading, setUploading] = useState<boolean>(false)

  // State for active section
  const [activeSection, setActiveSection] = useState<string>("")

  // State for submission
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Validate the token
  const tokenValidation = useQuery(api.assessmentTokens.validateToken, { token })

  // Get assessment template
  const assessmentData = useQuery(api.assessments.getAssessmentByToken, tokenValidation?.valid ? { token } : null)

  // Mutations
  const createSelfAssessment = useMutation(api.assessments.createSelfAssessment)
  const markTokenUsed = useMutation(api.assessmentTokens.markTokenUsed)
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl)

  // Initialize form data when template is loaded
  useEffect(() => {
    if (assessmentData?.formTemplate) {
      setFormData(assessmentData.formTemplate)

      // Set active section to first section
      if (assessmentData.formTemplate.sections.length > 0) {
        setActiveSection(assessmentData.formTemplate.sections[0].id)
      }
    }
  }, [assessmentData])

  // Handle form field changes
  const handleFieldChange = (sectionId: string, itemId: string, value: any) => {
    setFormData((prevData) => {
      const newData = { ...prevData }
      const sectionIndex = newData.sections.findIndex((s) => s.id === sectionId)

      if (sectionIndex !== -1) {
        const itemIndex = newData.sections[sectionIndex].items.findIndex((i) => i.id === itemId)

        if (itemIndex !== -1) {
          newData.sections[sectionIndex].items[itemIndex].value = value
        }
      }

      return newData
    })
  }

  // Handle image upload
  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return

    setUploading(true)

    try {
      const newImageUrls: string[] = []

      for (const file of files) {
        // Get a presigned URL for upload
        const { uploadUrl, storageId } = await generateUploadUrl({
          contentType: file.type,
        })

        // Upload the file
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        })

        if (!result.ok) {
          throw new Error(`Failed to upload image: ${result.statusText}`)
        }

        // Get the URL for the uploaded file
        const imageUrl = `${window.location.origin}/api/storage/${storageId}`
        newImageUrls.push(imageUrl)
      }

      // Update state with new image URLs
      setUploadedImages((prev) => [...prev, ...newImageUrls])

      toast({
        title: "Images uploaded",
        description: `Successfully uploaded ${files.length} image(s)`,
      })
    } catch (error) {
      console.error("Error uploading images:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!tokenValidation?.valid || !tokenValidation?.tokenId) {
      toast({
        title: "Invalid token",
        description: "The assessment token is invalid or expired.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // Create the assessment
      const result = await createSelfAssessment({
        tokenId: tokenValidation.tokenId,
        tenantId: tokenValidation.tenantId,
        vehicleId: tokenValidation.vehicleId,
        formData,
        images: uploadedImages,
      })

      // Mark the token as used
      await markTokenUsed({ tokenId: tokenValidation.tokenId })

      // Redirect to success page
      router.push(`/public/assess/success?id=${result.assessmentId}`)
    } catch (error) {
      console.error("Error submitting assessment:", error)
      toast({
        title: "Submission failed",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Handle token validation error
  if (tokenValidation && !tokenValidation.valid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Assessment Link</CardTitle>
            <CardDescription>
              {tokenValidation.reason || "This assessment link is invalid or has expired."}
            </CardDescription>
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

  // Loading state
  if (!assessmentData || !tokenValidation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" />
        <span className="ml-2">Loading assessment...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Vehicle Self-Assessment</CardTitle>
          <CardDescription>{assessmentData.tenant?.name || "Complete the assessment form below"}</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent>
            {/* Vehicle information if available */}
            {assessmentData.vehicle && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Vehicle Information</h3>
                <p>
                  <span className="font-semibold">Make:</span> {assessmentData.vehicle.make}
                </p>
                <p>
                  <span className="font-semibold">Model:</span> {assessmentData.vehicle.model}
                </p>
                <p>
                  <span className="font-semibold">Year:</span> {assessmentData.vehicle.year}
                </p>
                {assessmentData.vehicle.licensePlate && (
                  <p>
                    <span className="font-semibold">License Plate:</span> {assessmentData.vehicle.licensePlate}
                  </p>
                )}
              </div>
            )}

            {/* Tabs for sections */}
            <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                {formData.sections.map((section) => (
                  <TabsTrigger key={section.id} value={section.id}>
                    {section.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {formData.sections.map((section) => (
                <TabsContent key={section.id} value={section.id} className="py-4">
                  <div className="space-y-6">
                    {section.items.map((item) => (
                      <div key={item.id} className="space-y-2">
                        <Label htmlFor={item.id}>{item.label}</Label>

                        {/* Render different form controls based on item type */}
                        {item.type === "checkbox" && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={item.id}
                              checked={item.value === true}
                              onCheckedChange={(checked) => handleFieldChange(section.id, item.id, checked)}
                            />
                            <Label htmlFor={item.id} className="font-normal">
                              Yes
                            </Label>
                          </div>
                        )}

                        {item.type === "text" && (
                          <Input
                            id={item.id}
                            value={item.value || ""}
                            onChange={(e) => handleFieldChange(section.id, item.id, e.target.value)}
                          />
                        )}

                        {item.type === "select" && item.options && (
                          <Select
                            value={item.value || ""}
                            onValueChange={(value) => handleFieldChange(section.id, item.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              {item.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {item.type === "photo" && (
                          <div className="space-y-2">
                            <FileUploader
                              onFilesSelected={handleImageUpload}
                              accept="image/*"
                              multiple
                              maxFiles={5}
                              maxSize={5 * 1024 * 1024} // 5MB
                              disabled={uploading}
                            />

                            {/* Preview uploaded images */}
                            {uploadedImages.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                {uploadedImages.map((url, index) => (
                                  <div key={index} className="relative aspect-square">
                                    <img
                                      src={url || "/placeholder.svg"}
                                      alt={`Uploaded image ${index + 1}`}
                                      className="object-cover w-full h-full rounded-md"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const currentIndex = formData.sections.findIndex((s) => s.id === activeSection)
                if (currentIndex > 0) {
                  setActiveSection(formData.sections[currentIndex - 1].id)
                }
              }}
              disabled={formData.sections.findIndex((s) => s.id === activeSection) === 0}
            >
              Previous
            </Button>

            {formData.sections.findIndex((s) => s.id === activeSection) === formData.sections.length - 1 ? (
              <Button type="submit" disabled={submitting || uploading}>
                {submitting ? "Submitting..." : "Submit Assessment"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  const currentIndex = formData.sections.findIndex((s) => s.id === activeSection)
                  if (currentIndex < formData.sections.length - 1) {
                    setActiveSection(formData.sections[currentIndex + 1].id)
                  }
                }}
              >
                Next
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
