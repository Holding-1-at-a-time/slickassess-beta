import { internalAction } from "../../_generated/server"
import { v } from "convex/values"
import { sendEmail } from "../../../lib/gmailClient"

export default internalAction({
  args: {
    assessmentId: v.id("assessments"),
    tenantId: v.string(),
    previousStatus: v.optional(v.string()),
    newStatus: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Get the assessment data
      const assessment = await ctx.runQuery("assessments/getAssessmentById", {
        assessmentId: args.assessmentId,
        tenantId: args.tenantId,
      })

      if (!assessment) {
        throw new Error("Assessment not found")
      }

      // Get tenant information
      const tenant = await ctx.runQuery("tenants/getTenantById", {
        tenantId: args.tenantId,
      })

      if (!tenant) {
        throw new Error("Tenant not found")
      }

      // Get customer email if available
      let customerEmail = assessment.customerEmail

      // If no customer email but we have a vehicle, try to get the owner's email
      if (!customerEmail && assessment.vehicleId) {
        const vehicle = await ctx.runQuery("vehicles/getVehicleById", {
          vehicleId: assessment.vehicleId,
          tenantId: args.tenantId,
        })

        if (vehicle && vehicle.ownerEmail) {
          customerEmail = vehicle.ownerEmail
        }
      }

      // If we have a customer email, send the notification
      if (customerEmail) {
        // Prepare email content based on status change
        let subject = `Assessment Status Update: ${args.newStatus}`
        let body = `<h2>Assessment Status Update</h2>`

        switch (args.newStatus) {
          case "approved":
            subject = `Your Assessment Has Been Approved`
            body += `
              <p>Good news! Your assessment has been approved.</p>
              <p>Estimated repair cost: $${assessment.estimatedPrice || "TBD"}</p>
              <p>Estimated time: ${assessment.estimatedDuration || "TBD"} minutes</p>
              <p>Please contact us to schedule your service appointment.</p>
            `
            break
          case "rejected":
            subject = `Your Assessment Requires Additional Information`
            body += `
              <p>We've reviewed your assessment and need additional information.</p>
              <p>Please contact us at ${tenant.phone || tenant.email} to discuss next steps.</p>
            `
            break
          case "completed":
            subject = `Your Assessment Has Been Completed`
            body += `
              <p>Your assessment has been completed and is ready for review.</p>
              <p>You can view the details by clicking the link below:</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/public/assessments/${args.assessmentId}/view">View Assessment</a></p>
            `
            break
          default:
            body += `
              <p>Your assessment status has been updated to: ${args.newStatus}</p>
              <p>If you have any questions, please contact us at ${tenant.phone || tenant.email}.</p>
            `
        }

        // Add tenant branding and footer
        body += `
          <hr>
          <p style="color: #666; font-size: 12px;">
            This email was sent by ${tenant.name}.<br>
            ${tenant.address || ""}
          </p>
        `

        // Send the email
        await sendEmail({
          to: customerEmail,
          subject,
          body,
        })

        return { success: true, emailSent: true }
      }

      return { success: true, emailSent: false }
    } catch (error) {
      console.error("Error sending status notification:", error)
      throw new Error(`Failed to send status notification: ${error}`)
    }
  },
})
