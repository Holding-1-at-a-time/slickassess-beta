import { mutation, query } from "../_generated/server"
import { v } from "convex/values"

export const getFile = query({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId)
    if (!file) {
      throw new Error("File not found")
    }

    // Get the serving URL
    const url = file.storageId ? await ctx.storage.getUrl(file.storageId) : null

    return {
      ...file,
      url,
    }
  },
})

export const listFiles = query({
  args: {
    tenantId: v.string(),
    category: v.optional(
      v.union(v.literal("assessment"), v.literal("vehicle"), v.literal("report"), v.literal("profile")),
    ),
    assessmentId: v.optional(v.id("assessments")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("files").withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category))
    }

    if (args.assessmentId) {
      query = query.filter((q) => q.eq(q.field("metadata.assessmentId"), args.assessmentId))
    }

    const files = await query.take(args.limit || 50)

    // Get URLs for all files
    const filesWithUrls = await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: file.storageId ? await ctx.storage.getUrl(file.storageId) : null,
      })),
    )

    return filesWithUrls
  },
})

export const deleteFile = mutation({
  args: {
    fileId: v.id("files"),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId)
    if (!file) {
      throw new Error("File not found")
    }

    // Delete from storage if exists
    if (file.storageId) {
      await ctx.storage.delete(file.storageId)
    }

    // Delete the database record
    await ctx.db.delete(args.fileId)

    return { success: true }
  },
})

export const updateFileMetadata = mutation({
  args: {
    fileId: v.id("files"),
    metadata: v.object({
      fileName: v.optional(v.string()),
      description: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId)
    if (!file) {
      throw new Error("File not found")
    }

    await ctx.db.patch(args.fileId, {
      metadata: {
        ...file.metadata,
        ...args.metadata,
      },
    })

    return { success: true }
  },
})
