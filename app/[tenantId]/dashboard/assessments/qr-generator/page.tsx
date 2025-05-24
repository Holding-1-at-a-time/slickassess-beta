"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/use-toast"
import { QrCode, Download, Printer, Copy } from "lucide-react"
import QRCode from "qrcode.react"

export default function QRGeneratorPage() {
  const params = useParams<{ tenantId: string }>()
  const { tenantId } = params

  // State
  const [vehicleId, setVehicleId] = useState<string>("")
  const [expiryHours, setExpiryHours] = useState<number>(24)
  const [tokenId, setTokenId] = useState<string>("")
  const [qrUrl, setQrUrl] = useState<string>("")
  const [generating, setGenerating] = useState<boolean>(false)

  // Queries
  const vehicles = useQuery(api.vehicles.listVehicles, { tenantId })

  // Mutations
  const generateToken = useMutation(api.assessmentTokens.generateToken)

  // Handle token generation
  const handleGenerateToken = async () => {
    setGenerating(true)

    try {
      const result = await generateToken({
        tenantId,
        vehicleId: vehicleId || undefined,
        expiryHours,
      })

      setTokenId(result.tokenId)
      setQrUrl(`${window.location.origin}/public/assess/${result.token}`)

      toast({
        title: "QR Code Generated",
        description: "The assessment QR code has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating token:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  // Handle QR code download
  const handleDownloadQR = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement
    if (!canvas) return

    const url = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = url
    link.download = `assessment-qr-${new Date().toISOString().slice(0, 10)}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle QR code printing
  const handlePrintQR = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const canvas = document.getElementById("qr-code") as HTMLCanvasElement
    if (!canvas) return

    const url = canvas.toDataURL("image/png")

    printWindow.document.write(`
      <html>
        <head>
          <title>Assessment QR Code</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 8px;
            }
            img {
              max-width: 300px;
              height: auto;
            }
            h2 {
              margin-bottom: 10px;
            }
            p {
              margin-top: 20px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>Vehicle Assessment</h2>
            <img src="${url}" alt="Assessment QR Code" />
            <p>Scan this QR code to complete your vehicle assessment</p>
            <p>Expires in ${expiryHours} hours</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  // Handle copy URL to clipboard
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrUrl)
    toast({
      title: "URL Copied",
      description: "The assessment URL has been copied to clipboard.",
    })
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Assessment QR Code Generator</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate QR Code</CardTitle>
            <CardDescription>Create a QR code for customer self-assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle (Optional)</Label>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="Select a vehicle or leave blank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific vehicle</SelectItem>
                  {vehicles?.map((vehicle) => (
                    <SelectItem key={vehicle._id} value={vehicle._id}>
                      {vehicle.year} {vehicle.make} {vehicle.model}{" "}
                      {vehicle.licensePlate ? `(${vehicle.licensePlate})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Time</Label>
              <Select value={expiryHours.toString()} onValueChange={(value) => setExpiryHours(Number.parseInt(value))}>
                <SelectTrigger id="expiry">
                  <SelectValue placeholder="Select expiry time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="8">8 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">48 hours</SelectItem>
                  <SelectItem value="168">7 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerateToken} disabled={generating} className="w-full">
              {generating ? (
                <>
                  <Spinner className="mr-2" size="sm" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Generate QR Code
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
            <CardDescription>Scan this code to access the assessment form</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {qrUrl ? (
              <>
                <div className="bg-white p-4 rounded-lg mb-4">
                  <QRCode id="qr-code" value={qrUrl} size={200} level="H" includeMargin renderAs="canvas" />
                </div>
                <div className="w-full">
                  <Label htmlFor="qr-url">Assessment URL</Label>
                  <div className="flex mt-1">
                    <Input id="qr-url" value={qrUrl} readOnly className="flex-1" />
                    <Button variant="outline" onClick={handleCopyUrl} className="ml-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-12 border border-dashed rounded-lg">
                <QrCode className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Generate a QR code to display here</p>
              </div>
            )}
          </CardContent>
          {qrUrl && (
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleDownloadQR}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" onClick={handlePrintQR}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
