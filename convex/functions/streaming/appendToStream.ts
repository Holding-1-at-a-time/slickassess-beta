import { mutation } from "./_generated/server"
import { v } from "convex/values"

// Define a proper type for the updates object
interface StreamUpdate {
  status?: string
  progress?: number
  result?: Record<string, any>
  error?: string
  [key: string]: any // For any additional fields that might be needed
}

// In the function
export default mutation({
  args: {
    streamId: v.id("streams"),
    updates: v.object({
      status: v.optional(v.string()),
      progress: v.optional(v.number()),
      result: v.optional(v.any()),
      error: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const { streamId, updates } = args

    // Now updates is properly typed
    const typedUpdates: StreamUpdate = updates

    // Rest of the function
    // ...
  },
})
