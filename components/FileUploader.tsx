"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploaderProps {
  onUpload: (files: File[]) => void
  maxFiles?: number
  maxSizeInMB?: number
  acceptedTypes?: string[]
}

// Utility function to format file sizes dynamically
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function FileUploader({
  onUpload,
  maxFiles = 5,
  maxSizeInMB = 10,
  acceptedTypes = ["image/*"],
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string>("")

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || [])
      setError("")

      // Validate file count
      if (selectedFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed`)
        return
      }

      // Validate file sizes
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024
      const oversizedFiles = selectedFiles.filter((file) => file.size > maxSizeInBytes)

      if (oversizedFiles.length > 0) {
        setError(`Files exceed maximum size of ${maxSizeInMB}MB`)
        return
      }

      setFiles(selectedFiles)
    },
    [maxFiles, maxSizeInMB],
  )

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    onUpload(files)
    setFiles([])
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">Click to upload or drag and drop</span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              multiple
              accept={acceptedTypes.join(",")}
              className="sr-only"
              onChange={handleFileChange}
            />
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Max {maxFiles} files, up to {maxSizeInMB}MB each
          </p>
        </div>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => removeFile(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button onClick={handleUpload} className="w-full">
            Upload {files.length} file{files.length !== 1 ? "s" : ""}
          </Button>
        </div>
      )}
    </div>
  )
}
