import { query } from "../_generated/server"
import { v } from "convex/values"

export default query({
  args: {
    fileId: v.id("files"),
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const { fileId, tenantId } = args

    // Get the current user
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Unauthorized: User not authenticated")
    }

    // Get the file
    const file = await ctx.db.get(fileId)
    if (!file) {
      throw new Error("File not found")
    }

    // Check tenant access
    if (file.tenantId !== tenantId) {
      throw new Error("Unauthorized: File belongs to a different tenant")
    }

    // Check user permissions within tenant
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_user_tenant", (q) => q.eq("userId", identity.subject).eq("tenantId", tenantId))
      .unique()

    if (!userRole) {
      throw new Error("Unauthorized: User does not have access to this tenant")
    }

    // Return the file with access URL
    return {
      ...file,
      url: await ctx.storage.getUrl(file.storageId),
    }
  },
})
