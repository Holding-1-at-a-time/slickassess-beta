import { z } from "zod"

// Assessment form item schema
export const FormItemSchema = z.object({
  id: z.string(),
  type: z.enum(["checkbox", "text", "select", "photo"]),
  label: z.string(),
  value: z.any().optional(),
  options: z.array(z.string()).optional(),
})

export type FormItem = z.infer<typeof FormItemSchema>

// Assessment form section schema
export const FormSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  items: z.array(FormItemSchema),
})

export type FormSection = z.infer<typeof FormSectionSchema>

// Complete assessment form schema
export const AssessmentFormSchema = z.object({
  sections: z.array(FormSectionSchema),
})

export type AssessmentForm = z.infer<typeof AssessmentFormSchema>

// Pricing rule schema
export const PricingRuleSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  basePrice: z.number().min(0, "Price must be non-negative"),
  duration: z.number().int().min(1, "Duration must be at least 1 minute"),
  multipliers: z
    .object({
      seasonal: z.number().optional(),
      weekend: z.number().optional(),
      holiday: z.number().optional(),
      loyalty: z.number().optional(),
      volume: z.number().optional(),
    })
    .optional(),
  active: z.boolean().default(true),
})

export type PricingRule = z.infer<typeof PricingRuleSchema>

// Assessment token schema
export const AssessmentTokenSchema = z.object({
  token: z.string(),
  tenantId: z.string(),
  vehicleId: z.string().optional(),
  expiresAt: z.number(),
})

export type AssessmentToken = z.infer<typeof AssessmentTokenSchema>

// AI analysis result schema
export const AIAnalysisSchema = z.object({
  detectedIssues: z.array(
    z.object({
      type: z.string(),
      location: z.string(),
      severity: z.number(),
      confidence: z.number(),
    }),
  ),
  summary: z.string(),
})

export type AIAnalysis = z.infer<typeof AIAnalysisSchema>
