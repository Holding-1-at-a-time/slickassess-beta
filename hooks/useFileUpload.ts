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
}

export function useFileUpload({ tenantId, category, onSuccess, onError }: UseFileUploadOptions) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const storeFileMetadata = useMutation(api.files.storeFileMetadata)

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true)
      setProgress(0)

      try {
        // Generate upload URL
        const uploadUrl = await generateUploadUrl({
          tenantId,
          category,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        })

        // Upload file
        const response = await fetch(uploadUrl, {
          method: "POST",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const { storageId } = await response.json()

        // Get image dimensions if it's an image
        let dimensions = {}
        if (file.type.startsWith("image/")) {
          const img = new Image()
          const url = URL.createObjectURL(file)
          await new Promise((resolve) => {
            img.onload = resolve
            img.src = url
          })
          dimensions = { width: img.width, height: img.height }
          URL.revokeObjectURL(url)
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
          metadata: dimensions,
        })

        setProgress(100)
        onSuccess?.(fileId)
        return fileId
      } catch (error) {
        console.error("Upload error:", error)
        onError?.(error as Error)
        throw error
      } finally {
        setUploading(false)
      }
    },
    [tenantId, category, generateUploadUrl, storeFileMetadata, onSuccess, onError],
  )

  const uploadMultiple = useCallback(
    async (files: File[]) => {
      const results = []
      for (let i = 0; i < files.length; i++) {
        setProgress((i / files.length) * 100)
        const fileId = await uploadFile(files[i])
        results.push(fileId)
      }
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
