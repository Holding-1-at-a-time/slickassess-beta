"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { nanoid } from "nanoid"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/use-toast"
import { Trash2, Plus, MoveUp, MoveDown } from "lucide-react"
import type { AssessmentForm, FormSection, FormItem } from "@/utils/formSchemas"

export default function AssessmentTemplatePage() {
  const params = useParams<{ tenantId: string }>()
  const { tenantId } = params

  // State
  const [template, setTemplate] = useState<AssessmentForm | null>(null)
  const [activeSection, setActiveSection] = useState<string>("")
  const [saving, setSaving] = useState<boolean>(false)

  // Queries
  const templateData = useQuery(api.assessmentTemplates.getTemplate, { tenantId })

  // Mutations
  const upsertTemplate = useMutation(api.assessmentTemplates.upsertTemplate)

  // Initialize template when data is loaded
  useEffect(() => {
    if (templateData) {
      setTemplate(templateData)

      // Set active section to first section
      if (templateData.sections.length > 0) {
        setActiveSection(templateData.sections[0].id)
      }
    }
  }, [templateData])

  // Handle saving the template
  const handleSave = async () => {
    if (!template) return

    setSaving(true)

    try {
      await upsertTemplate({
        tenantId,
        template,
      })

      toast({
        title: "Template saved",
        description: "The assessment template has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Save failed",
        description: "Failed to save the assessment template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Add a new section
  const handleAddSection = () => {
    if (!template) return

    const newSection: FormSection = {
      id: nanoid(),
      title: "New Section",
      items: [],
    }

    setTemplate({
      ...template,
      sections: [...template.sections, newSection],
    })

    setActiveSection(newSection.id)
  }

  // Remove a section
  const handleRemoveSection = (sectionId: string) => {
    if (!template) return

    const newSections = template.sections.filter((section) => section.id !== sectionId)

    setTemplate({
      ...template,
      sections: newSections,
    })

    // Set active section to first section if the active section was removed
    if (activeSection === sectionId && newSections.length > 0) {
      setActiveSection(newSections[0].id)
    }
  }

  // Update section title
  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    if (!template) return

    setTemplate({
      ...template,
      sections: template.sections.map((section) => (section.id === sectionId ? { ...section, title } : section)),
    })
  }

  // Add a new item to a section
  const handleAddItem = (sectionId: string, type: "checkbox" | "text" | "select" | "photo") => {
    if (!template) return

    const newItem: FormItem = {
      id: nanoid(),
      type,
      label: `New ${type} field`,
      value: type === "checkbox" ? false : "",
    }

    if (type === "select") {
      newItem.options = ["Option 1", "Option 2", "Option 3"]
    }

    setTemplate({
      ...template,
      sections: template.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: [...section.items, newItem],
            }
          : section,
      ),
    })
  }

  // Remove an item from a section
  const handleRemoveItem = (sectionId: string, itemId: string) => {
    if (!template) return

    setTemplate({
      ...template,
      sections: template.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter((item) => item.id !== itemId),
            }
          : section,
      ),
    })
  }

  // Update an item
  const handleUpdateItem = (sectionId: string, itemId: string, updates: Partial<FormItem>) => {
    if (!template) return

    setTemplate({
      ...template,
      sections: template.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      ...updates,
                    }
                  : item,
              ),
            }
          : section,
      ),
    })
  }

  // Move an item up
  const handleMoveItemUp = (sectionId: string, itemId: string) => {
    if (!template) return

    setTemplate({
      ...template,
      sections: template.sections.map((section) => {
        if (section.id !== sectionId) return section

        const itemIndex = section.items.findIndex((item) => item.id === itemId)
        if (itemIndex <= 0) return section

        const newItems = [...section.items]
        const temp = newItems[itemIndex]
        newItems[itemIndex] = newItems[itemIndex - 1]
        newItems[itemIndex - 1] = temp

        return {
          ...section,
          items: newItems,
        }
      }),
    })
  }

  // Move an item down
  const handleMoveItemDown = (sectionId: string, itemId: string) => {
    if (!template) return

    setTemplate({
      ...template,
      sections: template.sections.map((section) => {
        if (section.id !== sectionId) return section

        const itemIndex = section.items.findIndex((item) => item.id === itemId)
        if (itemIndex === -1 || itemIndex >= section.items.length - 1) return section

        const newItems = [...section.items]
        const temp = newItems[itemIndex]
        newItems[itemIndex] = newItems[itemIndex + 1]
        newItems[itemIndex + 1] = temp

        return {
          ...section,
          items: newItems,
        }
      }),
    })
  }

  // Loading state
  if (!template) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
        <span className="ml-2">Loading template...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assessment Template Editor</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Spinner className="mr-2" size="sm" />
              Saving...
            </>
          ) : (
            "Save Template"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Sections</CardTitle>
            <CardDescription>Organize your assessment into sections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {template.sections.map((section) => (
              <div
                key={section.id}
                className={`p-2 rounded-md cursor-pointer flex justify-between items-center ${
                  activeSection === section.id ? "bg-primary/10" : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <span>{section.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveSection(section.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddSection} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Section Editor</CardTitle>
            <CardDescription>Edit the selected section and its fields</CardDescription>
          </CardHeader>

          {template.sections.length === 0 ? (
            <CardContent>
              <div className="text-center p-6">
                <p className="text-gray-500 mb-4">No sections yet. Add a section to get started.</p>
                <Button onClick={handleAddSection}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Section
                </Button>
              </div>
            </CardContent>
          ) : (
            <Tabs value={activeSection} onValueChange={setActiveSection}>
              <TabsList className="px-6">
                {template.sections.map((section) => (
                  <TabsTrigger key={section.id} value={section.id}>
                    {section.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {template.sections.map((section) => (
                <TabsContent key={section.id} value={section.id}>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor={`section-title-${section.id}`}>Section Title</Label>
                      <Input
                        id={`section-title-${section.id}`}
                        value={section.title}
                        onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Fields</Label>
                      {section.items.length === 0 ? (
                        <div className="text-center p-4 border border-dashed rounded-md">
                          <p className="text-gray-500 mb-2">No fields yet. Add a field to get started.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {section.items.map((item, index) => (
                            <Card key={item.id}>
                              <CardContent className="pt-6 space-y-4">
                                <div className="flex justify-between items-center">
                                  <div className="font-medium">
                                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Field
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleMoveItemUp(section.id, item.id)}
                                      disabled={index === 0}
                                    >
                                      <MoveUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleMoveItemDown(section.id, item.id)}
                                      disabled={index === section.items.length - 1}
                                    >
                                      <MoveDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveItem(section.id, item.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor={`item-label-${item.id}`}>Field Label</Label>
                                  <Input
                                    id={`item-label-${item.id}`}
                                    value={item.label}
                                    onChange={(e) => handleUpdateItem(section.id, item.id, { label: e.target.value })}
                                  />
                                </div>

                                {item.type === "select" && (
                                  <div className="space-y-2">
                                    <Label htmlFor={`item-options-${item.id}`}>Options (one per line)</Label>
                                    <textarea
                                      id={`item-options-${item.id}`}
                                      className="w-full min-h-[100px] p-2 border rounded-md"
                                      value={(item.options || []).join("\n")}
                                      onChange={(e) =>
                                        handleUpdateItem(section.id, item.id, {
                                          options: e.target.value.split("\n").filter((line) => line.trim() !== ""),
                                        })
                                      }
                                    />
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => handleAddItem(section.id, "checkbox")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Checkbox
                      </Button>
                      <Button variant="outline" onClick={() => handleAddItem(section.id, "text")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Text Field
                      </Button>
                      <Button variant="outline" onClick={() => handleAddItem(section.id, "select")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Select Field
                      </Button>
                      <Button variant="outline" onClick={() => handleAddItem(section.id, "photo")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Photo Upload
                      </Button>
                    </div>
                  </CardContent>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </Card>
      </div>
    </div>
  )
}
