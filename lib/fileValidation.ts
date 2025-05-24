export const FILE_SIZE_LIMITS = {
  PROFILE_IMAGE: 5 * 1024 * 1024, // 5MB
  VEHICLE_IMAGE: 10 * 1024 * 1024, // 10MB
  DOCUMENT: 20 * 1024 * 1024, // 20MB
}

export const ALLOWED_FILE_TYPES = {
  IMAGES: ["image/jpeg", "image/png", "image/webp"],
  DOCUMENTS: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
}

type ValidationOptions = {
  maxSize?: number
  allowedTypes?: string[]
}

/**
 * Validates a file against size and type constraints
 * @param file The file to validate
 * @param options Validation options
 * @returns An object with validation result and any error message
 */
export function validateFile(file: File, options: ValidationOptions = {}) {
  const {
    maxSize = FILE_SIZE_LIMITS.DOCUMENT,
    allowedTypes = [...ALLOWED_FILE_TYPES.IMAGES, ...ALLOWED_FILE_TYPES.DOCUMENTS],
  } = options

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds the maximum allowed size of ${Math.round(maxSize / (1024 * 1024))}MB`,
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    }
  }

  return { valid: true }
}
