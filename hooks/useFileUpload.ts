"use client"

import { useState, useCallback } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

interface UseFileUploadOptions {
  tenantId: string
  category: "assessment_image" | "vehicle_document" | "report" | "avatar" | "logo"
  onSuccess?: (fileId: Id<"files">) => void
  onError?: (error: Error) => void
  maxFiles?: number
  maxSizeBytes?: number
  allowedTypes?: string[]
}

export function useFileUpload({
  tenantId,
  category,
  onSuccess,
  onError,
  maxFiles = 10,
  maxSizeBytes,
  allowedTypes,
}: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const storeFileMetadata = useMutation(api.files.storeFileMetadata)

  // Default size limits by category if not specified
  const defaultSizeLimits = {
    assessment_image: 10 * 1024 * 1024, // 10MB
    vehicle_document: 5 * 1024 * 1024, // 5MB
    report: 20 * 1024 * 1024, // 20MB
    avatar: 2 * 1024 * 1024, // 2MB
    logo: 2 * 1024 * 1024, // 2MB
  }

  // Default allowed types by category if not specified
  const defaultAllowedTypes = {
    assessment_image: ["image/jpeg", "image/png", "image/webp"],
    vehicle_document: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    report: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    avatar: ["image/jpeg", "image/png", "image/webp"],
    logo: ["image/jpeg", "image/png", "image/svg+xml", "image/webp"],
  }

  // Validate file before upload
  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file size
      const sizeLimit = maxSizeBytes || defaultSizeLimits[category]
      if (file.size > sizeLimit) {
        return {
          valid: false,
          error: `File size exceeds limit of ${sizeLimit / (1024 * 1024)}MB`,
        }
      }

      // Check file type
      const types = allowedTypes || defaultAllowedTypes[category]
      if (!types.includes(file.type)) {
        return {
          valid: false,
          error: `Invalid file type. Allowed types: ${types.join(", ")}`,
        }
      }

      return { valid: true }
    },
    [category, maxSizeBytes, allowedTypes],
  )

  const uploadFile = useCallback(
    async (file: File, metadata?: Record<string, any>) => {
      setUploading(true)
      setProgress(0)
      setError(null)

      try {
        // Validate file
        const validation = validateFile(file)
        if (!validation.valid) {
          throw new Error(validation.error)
        }

        // Generate upload URL
        const uploadUrl = await generateUploadUrl({
          tenantId,
          category,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        })

        // Upload file with progress tracking
        const xhr = new XMLHttpRequest()
        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100)
              setProgress(percentComplete)
            }
          })

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          })

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed due to network error"))
          })

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload aborted"))
          })

          xhr.open("POST", uploadUrl)
          xhr.setRequestHeader("Content-Type", file.type)
          xhr.send(file)
        })

        const response = JSON.parse(xhr.responseText)
        const { storageId } = response

        // Get image dimensions if it's an image
        let dimensions = {}
        if (file.type.startsWith("image/")) {
          dimensions = await getImageDimensions(file)
        }

        // Store metadata
        const { fileId } = await storeFileMetadata({
          storageId,
          tenantId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          mimeType: file.type,
          category,
          metadata: {
            ...dimensions,
            ...metadata,
          },
        })

        setProgress(100)
        onSuccess?.(fileId)
        return fileId
      } catch (error) {
        console.error("Upload error:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        setError(errorMessage)
        onError?.(error instanceof Error ? error : new Error(errorMessage))
        throw error
      } finally {
        setUploading(false)
      }
    },
    [tenantId, category, generateUploadUrl, storeFileMetadata, validateFile, onSuccess, onError],
  )

  // Helper function to get image dimensions
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({ width: 0, height: 0 })
      }
      img.src = url
    })
  }

  const uploadMultiple = useCallback(
    async (files: File[], metadata?: Record<string, any>[]) => {
      if (files.length > maxFiles) {
        const error = new Error(`Maximum of ${maxFiles} files allowed`)
        setError(error.message)
        onError?.(error)
        throw error
      }

      const results = []
      for (let i = 0; i < files.length; i++) {
        setProgress((i / files.length) * 100)
        const fileId = await uploadFile(files[i], metadata?.[i])
        results.push(fileId)
      }
      return results
    },
    [uploadFile, maxFiles, onError],
  )

  return {
    uploadFile,
    uploadMultiple,
    uploading,
    progress,
    error,
    validateFile,
  }
}
