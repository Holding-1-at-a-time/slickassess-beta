"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

export default function NewAssessmentPage({ params }: { params: { tenantId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tenantId = params.tenantId
  const vehicleId = searchParams.get("vehicleId")

  // In a real implementation, you would fetch vehicles from your backend
  const vehicles = [
    { id: "1", name: "Toyota Camry (ABC123)" },
    { id: "2", name: "Honda Accord (XYZ789)" },
    { id: "3", name: "Ford F-150 (DEF456)" },
    { id: "4", name: "Chevrolet Malibu (GHI789)" },
    { id: "5", name: "Nissan Altima (JKL012)" },
  ]

  const [formData, setFormData] = useState({
    vehicleId: vehicleId || "",
    assessmentType: "full",
    scheduledDate: "",
    notes: "",
    checkExterior: true,
    checkInterior: true,
    checkEngine: true,
    checkBrakes: true,
    checkTires: true,
    checkLights: true,
    checkFluids: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real implementation, you would submit this data to your backend
    console.log("Submitting assessment data:", formData)

    // Redirect back to the assessments list
    router.push(`/${tenantId}/dashboard/assessments`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-2">
          <Link href={`/${tenantId}/dashboard/assessments`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Assessment</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
            <CardDescription>Schedule a new vehicle assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehicle</Label>
              <Select
                value={formData.vehicleId}
                onValueChange={(value) => handleSelectChange("vehicleId", value)}
                required
              >
                <SelectTrigger id="vehicleId">
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assessmentType">Assessment Type</Label>
              <Select
                value={formData.assessmentType}
                onValueChange={(value) => handleSelectChange("assessmentType", value)}
                required
              >
                <SelectTrigger id="assessmentType">
                  <SelectValue placeholder="Select assessment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Inspection</SelectItem>
                  <SelectItem value="quick">Quick Check</SelectItem>
                  <SelectItem value="pre-purchase">Pre-Purchase Inspection</SelectItem>
                  <SelectItem value="damage">Damage Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                name="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Assessment Areas</Label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkExterior"
                    checked={formData.checkExterior}
                    onCheckedChange={(checked) => handleCheckboxChange("checkExterior", checked as boolean)}
                  />
                  <Label htmlFor="checkExterior">Exterior</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkInterior"
                    checked={formData.checkInterior}
                    onCheckedChange={(checked) => handleCheckboxChange("checkInterior", checked as boolean)}
                  />
                  <Label htmlFor="checkInterior">Interior</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkEngine"
                    checked={formData.checkEngine}
                    onCheckedChange={(checked) => handleCheckboxChange("checkEngine", checked as boolean)}
                  />
                  <Label htmlFor="checkEngine">Engine</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkBrakes"
                    checked={formData.checkBrakes}
                    onCheckedChange={(checked) => handleCheckboxChange("checkBrakes", checked as boolean)}
                  />
                  <Label htmlFor="checkBrakes">Brakes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkTires"
                    checked={formData.checkTires}
                    onCheckedChange={(checked) => handleCheckboxChange("checkTires", checked as boolean)}
                  />
                  <Label htmlFor="checkTires">Tires</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkLights"
                    checked={formData.checkLights}
                    onCheckedChange={(checked) => handleCheckboxChange("checkLights", checked as boolean)}
                  />
                  <Label htmlFor="checkLights">Lights</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="checkFluids"
                    checked={formData.checkFluids}
                    onCheckedChange={(checked) => handleCheckboxChange("checkFluids", checked as boolean)}
                  />
                  <Label htmlFor="checkFluids">Fluids</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Additional notes or instructions..."
                value={formData.notes}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">Schedule Assessment</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
