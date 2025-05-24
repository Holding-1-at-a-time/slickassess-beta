import { nanoid } from "nanoid"

// Replace crypto.randomUUID() with nanoid
const verificationToken = nanoid(36) // Generate a string of similar length to UUID
