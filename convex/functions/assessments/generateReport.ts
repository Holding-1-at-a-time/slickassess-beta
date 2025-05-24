import { internalAction } from "../../_generated/server"
import { v } from "convex/values"
import { generatePDF } from "../../../lib/pdfGenerator"

export default internalAction({
  args: {
    assessmentId: v.id("assessments"),
    tenantId: v.string(),
    format: v.optional(v.union(v.literal("detailed"), v.literal("summary"))),
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

      // Get tenant information for branding
      const tenant = await ctx.runQuery("tenants/getTenantById", {
        tenantId: args.tenantId,
      })

      if (!tenant) {
        throw new Error("Tenant not found")
      }

      // Get vehicle information if available
      let vehicle = null
      if (assessment.vehicleId) {
        vehicle = await ctx.runQuery("vehicles/getVehicleById", {
          vehicleId: assessment.vehicleId,
          tenantId: args.tenantId,
        })
      }

      // Generate the PDF report
      const reportFormat = args.format || "detailed"
      const pdfBuffer = await generatePDF({
        assessment,
        tenant,
        vehicle,
        format: reportFormat,
      })

      // Store the PDF in Convex storage
      const storageId = await ctx.storage.store(pdfBuffer)

      // Update the assessment with the report URL
      await ctx.runMutation("assessments/updateAssessment", {
        assessmentId: args.assessmentId,
        tenantId: args.tenantId,
        updates: {
          reportUrl: storageId,
          reportGeneratedAt: Date.now(),
        },
      })

      return {
        success: true,
        reportUrl: storageId,
      }
    } catch (error) {
      console.error("Error generating assessment report:", error)
      throw new Error(`Failed to generate assessment report: ${error}`)
    }
  },
})
