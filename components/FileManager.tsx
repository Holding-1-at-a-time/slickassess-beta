"use client"

import type React from "react"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useFileUpload } from "@/hooks/useFileUpload"
import { formatBytes, formatDate } from "@/lib/utils"
import { Trash2, Eye, Upload } from "lucide-react"
import type { Id } from "@/convex/_generated/dataModel"

interface FileManagerProps {
  tenantId: string
  category?: "assessment_image" | "vehicle_document" | "report" | "avatar" | "logo"
  assessmentId?: Id<"selfAssessments">
}

export function FileManager({ tenantId, category, assessmentId }: FileManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState(category || "assessment_image")
  const [selectedFiles, setSelectedFiles] = useState<Id<"files">[]>([])

  const files = useQuery(api.files.listFiles, {
    tenantId,
    category: selectedCategory,
    assessmentId,
  })

  const deleteFile = useMutation(api.files.deleteFile)
  const getFileUrl = useQuery(api.files.getFileUrl, selectedFiles.length === 1 ? { fileId: selectedFiles[0] } : "skip")

  const { uploadFile, uploading, progress } = useFileUpload({
    tenantId,
    category: selectedCategory,
    onSuccess: () => {
      setSelectedFiles([])
    },
  })

  const handleFileSelect = (fileId: Id<"files">) => {
    setSelectedFiles((prev) => (prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]))
  }

  const handleDelete = async () => {
    for (const fileId of selectedFiles) {
      await deleteFile({ fileId })
    }
    setSelectedFiles([])
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      await uploadFile(file)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>File Manager</CardTitle>
        <CardDescription>Manage your uploaded files and documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as any)}>
              <TabsList>
                <TabsTrigger value="assessment_image">Images</TabsTrigger>
                <TabsTrigger value="vehicle_document">Documents</TabsTrigger>
                <TabsTrigger value="report">Reports</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={selectedFiles.length === 0} onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete ({selectedFiles.length})
              </Button>
              <Button size="sm" disabled={uploading}>
                <label htmlFor="file-upload" className="cursor-pointer flex items-center">
                  <Upload className="h-4 w-4 mr-1" />
                  {uploading ? `Uploading... ${progress}%` : "Upload"}
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleUpload}
                  accept={selectedCategory === "assessment_image" ? "image/*" : "*"}
                />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files?.map((file) => (
              <div
                key={file._id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedFiles.includes(file._id) ? "border-primary bg-primary/5" : "hover:border-gray-400"
                }`}
                onClick={() => handleFileSelect(file._id)}
              >
                <div className="space-y-2">
                  {file.category === "assessment_image" && file.metadata?.thumbnailStorageId ? (
                    <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                      <img
                        src={`/api/files/thumbnail/${file._id}`}
                        alt={file.fileName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                      <Eye className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  <div>
                    <p className="font-medium text-sm truncate">{file.fileName}</p>
                    <p className="text-xs text-gray-500">{formatBytes(file.fileSize)}</p>
                    <p className="text-xs text-gray-500">{formatDate(file.createdAt)}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      {file.category.replace("_", " ")}
                    </Badge>
                    {file.isPublic && (
                      <Badge variant="secondary" className="text-xs">
                        Public
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {files?.length === 0 && (
            <div className="text-center py-8 text-gray-500">No files found. Upload some files to get started.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
