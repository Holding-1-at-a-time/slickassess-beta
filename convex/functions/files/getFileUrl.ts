import { v } from "convex/values"
import { mutation, query } from "../_generated/server"
import { requireAuth } from "../lib/authMiddleware"

export const getFileUrl = query({
  args: {
    fileId: v.id("files"),
    requireTenantMatch: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const user = await requireAuth(ctx)

    // Get the file
    const file = await ctx.db.get(args.fileId)
    if (!file) {
      throw new Error("File not found")
    }

    // Check if file is marked as private and requires tenant match
    const requireTenantMatch = args.requireTenantMatch ?? file.isPrivate ?? true

    // Enforce tenant-based access for private files
    if (requireTenantMatch && file.tenantId) {
      // Ensure user's tenant matches file's tenant
      if (user.tenantId !== file.tenantId) {
        throw new Error("Access denied: You don't have permission to access this file")
      }
    }

    // Check if file has explicit access control
    if (file.allowedUsers && !file.allowedUsers.includes(user._id)) {
      throw new Error("Access denied: You don't have permission to access this file")
    }

    // Generate storage URL
    const url = await ctx.storage.getUrl(file.storageId)
    if (!url) {
      throw new Error("File URL not available")
    }

    // Log file access for auditing
    await ctx.db.insert("fileAccessLogs", {
      fileId: args.fileId,
      userId: user._id,
      tenantId: user.tenantId,
      accessedAt: Date.now(),
      ipAddress: ctx.request?.headers?.get("x-forwarded-for") || "unknown",
    })

    return {
      url,
      fileName: file.name,
      contentType: file.contentType,
      size: file.size,
      expiresAt: Date.now() + 3600000, // URL expires in 1 hour
    }
  },
})

// Mutation to update file privacy settings
export const updateFilePrivacy = mutation({
  args: {
    fileId: v.id("files"),
    isPrivate: v.boolean(),
    allowedUsers: v.optional(v.array(v.id("users"))),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx)

    const file = await ctx.db.get(args.fileId)
    if (!file) {
      throw new Error("File not found")
    }

    // Only file owner or tenant admin can update privacy settings
    if (file.uploadedBy !== user._id && user.role !== "admin") {
      throw new Error("Access denied: Only the file owner or admin can update privacy settings")
    }

    // Ensure tenant match for security
    if (file.tenantId !== user.tenantId) {
      throw new Error("Access denied: File belongs to a different tenant")
    }

    await ctx.db.patch(args.fileId, {
      isPrivate: args.isPrivate,
      allowedUsers: args.allowedUsers,
      updatedAt: Date.now(),
      updatedBy: user._id,
    })

    return { success: true }
  },
})
