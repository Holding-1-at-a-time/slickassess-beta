import { escape } from "html-escaper"

/**
 * Safely creates an HTML email template with proper escaping
 * @param data The data to include in the template
 * @returns A safely constructed HTML string
 */
export function createBookingConfirmationEmail(data: {
  customerName: string
  bookingDate: string
  bookingTime: string
  vehicleDetails: string
  confirmationLink: string
}) {
  // Escape all user-provided data to prevent XSS
  const safeData = {
    customerName: escape(data.customerName),
    bookingDate: escape(data.bookingDate),
    bookingTime: escape(data.bookingTime),
    vehicleDetails: escape(data.vehicleDetails),
    // Don't escape the confirmation link as it needs to be clickable
    confirmationLink: data.confirmationLink,
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation</title>
    </head>
    <body>
      <h1>Booking Confirmation</h1>
      <p>Hello ${safeData.customerName},</p>
      <p>Your booking has been confirmed for ${safeData.bookingDate} at ${safeData.bookingTime}.</p>
      <p>Vehicle: ${safeData.vehicleDetails}</p>
      <p><a href="${safeData.confirmationLink}">View Booking Details</a></p>
    </body>
    </html>
  `
}
