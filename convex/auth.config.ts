import { defineAuth } from "convex/server"
import { v4 as uuidv4 } from "uuid"

// Define the auth configuration for Convex
export default defineAuth({
  // Provide unique IDs for unauthenticated users (for initial sessions)
  providers: [
    {
      name: "anonymous",
      // Generate a unique ID for anonymous users
      getIdentityId: async () => {
        return `anonymous:${uuidv4()}`
      },
    },
  ],
})
