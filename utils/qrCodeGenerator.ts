import QRCode from "qrcode"

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark: string
    light: string
  }
  errorCorrectionLevel?: "L" | "M" | "Q" | "H"
}

/**
 * Generates a QR code for a self-assessment URL
 * @param baseUrl The base URL of the application
 * @param token The assessment token
 * @param options QR code generation options
 * @returns A Promise that resolves to a data URL of the QR code
 */
export async function generateAssessmentQRCode(
  baseUrl: string,
  token: string,
  options: QRCodeOptions = {},
): Promise<string> {
  const url = `${baseUrl}/public/assess/${token}`

  const qrOptions = {
    width: options.width || 300,
    margin: options.margin || 4,
    color: options.color || {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: options.errorCorrectionLevel || "M",
  }

  try {
    return await QRCode.toDataURL(url, qrOptions)
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw new Error("Failed to generate QR code")
  }
}

/**
 * Generates a QR code as an SVG string
 * @param baseUrl The base URL of the application
 * @param token The assessment token
 * @param options QR code generation options
 * @returns A Promise that resolves to an SVG string
 */
export async function generateAssessmentQRCodeSVG(
  baseUrl: string,
  token: string,
  options: QRCodeOptions = {},
): Promise<string> {
  const url = `${baseUrl}/public/assess/${token}`

  const qrOptions = {
    width: options.width || 300,
    margin: options.margin || 4,
    color: options.color || {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: options.errorCorrectionLevel || "M",
  }

  try {
    return await QRCode.toString(url, {
      ...qrOptions,
      type: "svg",
    })
  } catch (error) {
    console.error("Error generating QR code SVG:", error)
    throw new Error("Failed to generate QR code SVG")
  }
}
