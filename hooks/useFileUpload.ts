"use client"

import { useState, useCallback } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

interface UseFileUploadOptions {
  tenantId: string
  category: "assessment" | "vehicle" | "report" | "profile"
  onSuccess?: (fileId: Id<"files">, url: string) => void
  onError?: (error: Error) => void
}

export function useFileUpload(options: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const generateUploadUrl = useMutation(api.files.uploadFile.generateUploadUrl)
  const confirmUpload = useMutation(api.files.uploadFile.confirmUpload)

  const uploadFile = useCallback(
    async (file: File, metadata?: Record<string, any>) => {
      setUploading(true)
      setProgress(0)

      try {
        // Generate upload URL
        const { uploadUrl, fileId } = await generateUploadUrl({
          tenantId: options.tenantId,
          category: options.category,
          metadata: {
            fileName: file.name,
            contentType: file.type,
            size: file.size,
            ...metadata,
          },
        })

        // Upload the file
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to upload file")
        }

        // Get the storage ID from the response
        const { storageId } = await response.json()

        // Confirm the upload
        const { url } = await confirmUpload({
          fileId,
          storageId,
        })

        setProgress(100)
        options.onSuccess?.(fileId, url)

        return { fileId, url }
      } catch (error) {
        console.error("File upload error:", error)
        options.onError?.(error as Error)
        throw error
      } finally {
        setUploading(false)
      }
    },
    [generateUploadUrl, confirmUpload, options],
  )

  const uploadMultiple = useCallback(
    async (files: File[], metadata?: Record<string, any>) => {
      const results = []
      for (let i = 0; i < files.length; i++) {
        setProgress((i / files.length) * 100)
        const result = await uploadFile(files[i], metadata)
        results.push(result)
      }
      setProgress(100)
      return results
    },
    [uploadFile],
  )

  return {
    uploadFile,
    uploadMultiple,
    uploading,
    progress,
  }
}
