"use client"

import { useState, useCallback, useEffect } from "react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, FileText, Car, Wrench, MessageSquare } from "lucide-react"
import { debounce } from "@/lib/utils"

interface SearchInterfaceProps {
  tenantId: string
  onResultClick?: (result: any) => void
}

const contentTypeIcons = {
  assessment: FileText,
  vehicle: Car,
  damage_description: Wrench,
  service_description: Wrench,
  customer_note: MessageSquare,
}

export function SearchInterface({ tenantId, onResultClick }: SearchInterfaceProps) {
  const [query, setQuery] = useState("")
  const [searchType, setSearchType] = useState<"hybrid" | "text" | "vector">("hybrid")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const hybridSearch = useAction(api.search.hybridSearch)
  const vectorSearch = useAction(api.search.vectorSearch)

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        let searchResults
        if (searchType === "hybrid") {
          searchResults = await hybridSearch({
            query: searchQuery,
            tenantId,
            contentTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
            limit: 20,
          })
        } else if (searchType === "vector") {
          searchResults = await vectorSearch({
            query: searchQuery,
            tenantId,
            contentTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
            limit: 20,
          })
        }

        setResults(searchResults?.results || [])
      } catch (error) {
        console.error("Search error:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [tenantId, searchType, selectedTypes, hybridSearch, vectorSearch],
  )

  const debouncedSearch = useCallback(
    debounce((value: string) => performSearch(value), 500),
    [performSearch],
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  const toggleContentType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search</CardTitle>
        <CardDescription>Search across assessments, vehicles, and notes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search for damage, vehicles, or notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={searchType} onValueChange={(v) => setSearchType(v as any)}>
              <TabsList>
                <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="vector">Semantic</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex gap-2 flex-wrap">
            {Object.entries(contentTypeIcons).map(([type, Icon]) => (
              <Button
                key={type}
                variant={selectedTypes.includes(type) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleContentType(type)}
              >
                <Icon className="h-3 w-3 mr-1" />
                {type.replace("_", " ")}
              </Button>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              {results.map((result) => {
                const Icon = contentTypeIcons[result.contentType as keyof typeof contentTypeIcons]
                return (
                  <div
                    key={result.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onResultClick?.(result)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {result.contentType.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-gray-500">Score: {result.score.toFixed(2)}</span>
                        </div>
                        <p className="text-sm line-clamp-2">{result.text}</p>
                        {result.metadata && (
                          <div className="mt-1 text-xs text-gray-500">
                            {result.metadata.assessmentId && <span>Assessment ID: {result.metadata.assessmentId}</span>}
                            {result.metadata.vehicleId && <span> • Vehicle ID: {result.metadata.vehicleId}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-8 text-gray-500">No results found for "{query}"</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
