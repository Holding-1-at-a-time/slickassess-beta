"use client"

import { useState, useRef } from "react"
import { useParams } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/use-toast"
import { generateAssessmentQRCodeSVG } from "@/utils/qrCodeGenerator"

export default function QRGeneratorPage() {
  const params = useParams<{ tenantId: string }>()
  const { tenantId } = params

  // State
  const [selectedVehicle, setSelectedVehicle] = useState<string>("")
  const [expiryHours, setExpiryHours] = useState<number>(24)
  const [qrCodeSVG, setQrCodeSVG] = useState<string | null>(null)
  const [qrCodeToken, setQrCodeToken] = useState<string | null>(null)
  const [generating, setGenerating] = useState<boolean>(false)

  // Refs
  const qrCodeRef = useRef<HTMLDivElement>(null)

  // Queries
  const vehicles = useQuery(api.vehicles.listVehicles, { tenantId })

  // Mutations
  const generateToken = useMutation(api.assessmentTokens.generateToken)

  // Generate QR code
  const handleGenerateQR = async () => {
    setGenerating(true)

    try {
      // Generate token
      const tokenData = await generateToken({
        tenantId,
        vehicleId: selectedVehicle || undefined,
        expiryMinutes: expiryHours * 60,
      })

      // Generate QR code
      const baseUrl = window.location.origin
      const svg = await generateAssessmentQRCodeSVG(baseUrl, tokenData.token)

      // Update state
      setQrCodeSVG(svg)
      setQrCodeToken(tokenData.token)

      toast({
        title: "QR Code Generated",
        description: "The QR code has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  // Download QR code as SVG
  const handleDownloadSVG = () => {
    if (!qrCodeSVG) return

    const blob = new Blob([qrCodeSVG], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `assessment-qr-${Date.now()}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Download QR code as PNG
  const handleDownloadPNG = () => {
    if (!qrCodeRef.current) return

    const svg = qrCodeRef.current.querySelector("svg")
    if (!svg) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const pngUrl = canvas.toDataURL("image/png")
      const a = document.createElement("a")
      a.href = pngUrl
      a.download = `assessment-qr-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  // Print QR code
  const handlePrint = () => {
    if (!qrCodeRef.current) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const token = qrCodeToken || ""
    const url = `${window.location.origin}/public/assess/${token}`

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Assessment QR Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .qr-container {
              margin: 20px auto;
              max-width: 300px;
            }
            .qr-code {
              width: 100%;
              height: auto;
            }
            .url {
              margin-top: 20px;
              word-break: break-all;
              font-size: 14px;
            }
            .instructions {
              margin-top: 30px;
              text-align: left;
              max-width: 500px;
              margin-left: auto;
              margin-right: auto;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <h1>Vehicle Self-Assessment</h1>
          <div class="qr-container">
            ${qrCodeSVG}
          </div>
          <div class="url">
            <p>Or visit: ${url}</p>
          </div>
          <div class="instructions">
            <h2>Instructions:</h2>
            <ol>
              <li>Scan the QR code with your smartphone camera</li>
              <li>Complete the vehicle self-assessment form</li>
              <li>Submit the form to receive your estimate</li>
            </ol>
          </div>
          <button class="no-print" onclick="window.print()">Print</button>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Assessment QR Code Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate QR Code</CardTitle>
            <CardDescription>Create a QR code that customers can scan to complete a self-assessment</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle (Optional)</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="Select a vehicle (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific vehicle</SelectItem>
                  {vehicles?.map((vehicle) => (
                    <SelectItem key={vehicle._id} value={vehicle._id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Time (Hours)</Label>
              <Input
                id="expiry"
                type="number"
                min="1"
                max="168"
                value={expiryHours}
                onChange={(e) => setExpiryHours(Number.parseInt(e.target.value) || 24)}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button onClick={handleGenerateQR} disabled={generating} className="w-full">
              {generating ? (
                <>
                  <Spinner className="mr-2" size="sm" />
                  Generating...
                </>
              ) : (
                "Generate QR Code"
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
            <CardDescription>Scan this code to access the self-assessment form</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center">
            {qrCodeSVG ? (
              <div
                ref={qrCodeRef}
                className="w-64 h-64 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: qrCodeSVG }}
              />
            ) : (
              <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                QR code will appear here
              </div>
            )}

            {qrCodeToken && (
              <div className="mt-4 text-sm text-gray-500 text-center">
                <p>
                  URL: {window.location.origin}/public/assess/{qrCodeToken}
                </p>
                <p className="mt-1">Expires in {expiryHours} hours</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleDownloadSVG} disabled={!qrCodeSVG}>
              Download SVG
            </Button>
            <Button variant="outline" onClick={handleDownloadPNG} disabled={!qrCodeSVG}>
              Download PNG
            </Button>
            <Button onClick={handlePrint} disabled={!qrCodeSVG}>
              Print
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
