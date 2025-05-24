import { mutation } from "../../_generated/server"
import { v } from "convex/values"
import { internal } from "../../_generated/api"

export default mutation({
  args: {
    tokenId: v.id("assessmentTokens"),
    tenantId: v.string(),
    vehicleId: v.optional(v.id("vehicles")),
    formData: v.object({
      sections: v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          items: v.array(
            v.object({
              id: v.string(),
              type: v.union(v.literal("checkbox"), v.literal("text"), v.literal("select"), v.literal("photo")),
              label: v.string(),
              value: v.optional(v.any()),
              options: v.optional(v.array(v.string())),
            }),
          ),
        }),
      ),
    }),
    fileIds: v.array(v.id("files")),
  },
  handler: async (ctx, args) => {
    // Validate token
    const token = await ctx.db.get(args.tokenId)
    if (!token || token.used || token.expiresAt < Date.now()) {
      throw new Error("Invalid or expired token")
    }

    // Get file URLs
    const files = await Promise.all(
      args.fileIds.map(async (fileId) => {
        const file = await ctx.db.get(fileId)
        if (!file) throw new Error("File not found")
        return file
      }),
    )

    // Create assessment
    const assessmentId = await ctx.db.insert("selfAssessments", {
      tenantId: args.tenantId,
      vehicleId: args.vehicleId,
      tokenId: args.tokenId,
      status: "pending",
      formData: args.formData,
      images: files.map((f) => f.storageId),
      fileIds: args.fileIds,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Update file metadata with assessment ID
    await Promise.all(
      args.fileIds.map((fileId) =>
        ctx.db.patch(fileId, {
          metadata: {
            assessmentId,
          },
          updatedAt: Date.now(),
        }),
      ),
    )

    // Mark token as used
    await ctx.db.patch(args.tokenId, { used: true })

    // Generate embeddings for searchable content
    const searchableText = args.formData.sections
      .flatMap((section) =>
        section.items
          .filter((item) => item.type === "text" && item.value)
          .map((item) => `${item.label}: ${item.value}`),
      )
      .join(" ")

    if (searchableText) {
      await ctx.scheduler.runAfter(0, internal.embeddings.generateEmbedding, {
        text: searchableText,
        tenantId: args.tenantId,
        contentId: assessmentId,
        contentType: "assessment",
        metadata: {
          assessmentId,
          vehicleId: args.vehicleId,
        },
      })
    }

    // Schedule AI analysis if images exist
    if (files.length > 0) {
      await ctx.scheduler.runAfter(0, internal.assessments.analyzeImages, {
        assessmentId,
        tenantId: args.tenantId,
      })
    }

    return { assessmentId }
  },
})
