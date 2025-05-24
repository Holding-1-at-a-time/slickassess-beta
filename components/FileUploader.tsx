"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { UploadCloud, X, FileText, ImageIcon, File } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void
  accept?: string | Record<string, string[]>
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // in bytes
  disabled?: boolean
}

export function FileUploader({
  onFilesSelected,
  accept,
  multiple = false,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
  disabled = false,
}: FileUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach(({ file, errors }) => {
          errors.forEach((error: any) => {
            let errorMessage = ""

            switch (error.code) {
              case "file-too-large":
                errorMessage = `File ${file.name} is too large. Max size is ${maxSize / (1024 * 1024)}MB.`
                break
              case "file-invalid-type":
                errorMessage = `File ${file.name} has an invalid file type.`
                break
              case "too-many-files":
                errorMessage = `Too many files selected. Max is ${maxFiles}.`
                break
              default:
                errorMessage = `Error with file ${file.name}: ${error.message}`
            }

            toast({
              title: "File Upload Error",
              description: errorMessage,
              variant: "destructive",
            })
          })
        })
      }

      // Handle accepted files
      if (multiple) {
        // Check if adding these files would exceed maxFiles
        if (selectedFiles.length + acceptedFiles.length > maxFiles) {
          toast({
            title: "Too many files",
            description: `You can upload a maximum of ${maxFiles} files.`,
            variant: "destructive",
          })

          // Only add files up to the limit
          const remainingSlots = maxFiles - selectedFiles.length
          const filesToAdd = acceptedFiles.slice(0, remainingSlots)

          setSelectedFiles((prev) => [...prev, ...filesToAdd])
          onFilesSelected(filesToAdd)
        } else {
          setSelectedFiles((prev) => [...prev, ...acceptedFiles])
          onFilesSelected(acceptedFiles)
        }
      } else {
        // Single file mode
        setSelectedFiles([acceptedFiles[0]])
        onFilesSelected([acceptedFiles[0]])
      }
    },
    [multiple, maxFiles, maxSize, selectedFiles, onFilesSelected],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
    maxSize,
    disabled,
  })

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    } else if (file.type.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-500" />
    } else {
      return <File className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? "Drop the files here..."
            : `Drag & drop ${multiple ? "files" : "a file"} here, or click to select`}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {multiple
            ? `Up to ${maxFiles} files, max ${maxSize / (1024 * 1024)}MB each`
            : `Max file size: ${maxSize / (1024 * 1024)}MB`}
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Files:</p>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <div className="flex items-center">
                  {getFileIcon(file)}
                  <span className="ml-2 text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)} disabled={disabled}>
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
