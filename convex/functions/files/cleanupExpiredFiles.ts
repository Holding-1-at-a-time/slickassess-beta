import { internalMutation } from "../../_generated/server"

export default internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()

    // Find expired files
    const expiredFiles = await ctx.db
      .query("files")
      .withIndex("by_expiry")
      .filter((q) => q.lt(q.field("expiresAt"), now))
      .collect()

    console.log(`Found ${expiredFiles.length} expired files to clean up`)

    // Delete each expired file
    for (const file of expiredFiles) {
      try {
        // Delete from storage
        await ctx.storage.delete(file.storageId)

        // Delete thumbnail if exists
        if (file.metadata?.thumbnailStorageId) {
          await ctx.storage.delete(file.metadata.thumbnailStorageId)
        }

        // Delete metadata
        await ctx.db.delete(file._id)

        console.log(`Deleted expired file: ${file.fileName}`)
      } catch (error) {
        console.error(`Error deleting file ${file._id}:`, error)
      }
    }

    return { deletedCount: expiredFiles.length }
  },
})
