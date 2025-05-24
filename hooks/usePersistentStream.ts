"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useState, useEffect, useCallback } from "react"

interface UsePersistentStreamOptions {
  sessionId: string
  tenantId: string
  type: "assessment_analysis" | "chat_response" | "report_generation"
  onComplete?: (content: string) => void
  onError?: (error: string) => void
}

export function usePersistentStream({ sessionId, tenantId, type, onComplete, onError }: UsePersistentStreamOptions) {
  const [streamId, setStreamId] = useState<Id<"textStreams"> | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)

  const createStream = useMutation(api.streaming.createStream)
  const appendToStream = useMutation(api.streaming.appendToStream)
  const stream = useQuery(api.streaming.getStream, streamId ? { streamId } : "skip")

  const startStream = useCallback(
    async (metadata?: any) => {
      try {
        setIsStreaming(true)
        const id = await createStream({
          sessionId,
          tenantId,
          type,
          metadata,
        })
        setStreamId(id)
        return id
      } catch (error) {
        setIsStreaming(false)
        onError?.(error instanceof Error ? error.message : "Failed to start stream")
        throw error
      }
    },
    [sessionId, tenantId, type, createStream, onError],
  )

  const appendContent = useCallback(
    async (content: string, isComplete = false) => {
      if (!streamId) {
        throw new Error("Stream not started")
      }

      try {
        await appendToStream({
          streamId,
          content,
          isComplete,
        })

        if (isComplete) {
          setIsStreaming(false)
          onComplete?.(stream?.content || "")
        }
      } catch (error) {
        setIsStreaming(false)
        onError?.(error instanceof Error ? error.message : "Failed to append to stream")
        throw error
      }
    },
    [streamId, appendToStream, stream, onComplete, onError],
  )

  useEffect(() => {
    if (stream?.status === "failed" && stream.error) {
      onError?.(stream.error)
      setIsStreaming(false)
    }
  }, [stream, onError])

  return {
    streamId,
    stream,
    isStreaming,
    startStream,
    appendContent,
    content: stream?.content || "",
    status: stream?.status,
  }
}
