"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { nanoid } from "nanoid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/use-toast"
import { Trash2, Plus, GripVertical, Save, Undo } from "lucide-react"
import type { AssessmentForm, FormSection, FormItem } from "@/utils/formSchemas"
import { createDefaultAssessmentTemplate } from "@/utils/defaultAssessmentTemplate"

export default function AssessmentTemplatePage() {
  const params = useParams<{ tenantId: string }>()
  const { tenantId } = params

  // State
  const [template, setTemplate] = useState<AssessmentForm | null>(null)
  const [originalTemplate, setOriginalTemplate] = useState<AssessmentForm | null>(null)
  const [activeSection, setActiveSection] = useState<string>("")
  const [saving, setSaving] = useState<boolean>(false)

  // Queries
  const templateData = useQuery(api.assessmentTemplates.getTemplate, { tenantId })

  // Mutations
  const upsertTemplate = useMutation(api.assessmentTemplates.upsertTemplate)

  // Initialize template data
  useEffect(() => {
    if (templateData) {
      setTemplate(templateData)
      setOriginalTemplate(JSON.parse(JSON.stringify(templateData)))

      // Set active section to first section
      if (templateData.sections.length > 0) {
        setActiveSection(templateData.sections[0].id)
      }
    }
  }, [templateData])

  // Handle section title change
  const handleSectionTitleChange = (sectionId: string, title: string) => {
    if (!template) return

    setTemplate((prev) => {
      if (!prev) return prev

      const newTemplate = { ...prev }
      const sectionIndex = newTemplate.sections.findIndex((s) => s.id === sectionId)

      if (sectionIndex !== -1) {
        newTemplate.sections[sectionIndex].title = title
      }

      return newTemplate
    })
  }

  // Handle item change
  const handleItemChange = (sectionId: string, itemId: string, field: string, value: any) => {
    if (!template) return

    setTemplate((prev) => {
      if (!prev) return prev

      const newTemplate = { ...prev }
      const sectionIndex = newTemplate.sections.findIndex((s) => s.id === sectionId)

      if (sectionIndex !== -1) {
        const itemIndex = newTemplate.sections[sectionIndex].items.findIndex((i) => i.id === itemId)

        if (itemIndex !== -1) {
          newTemplate.sections[sectionIndex].items[itemIndex] = {
            ...newTemplate.sections[sectionIndex].items[itemIndex],
            [field]: value,
          }
        }
      }

      return newTemplate
    })
  }

  // Add a new section
  const addSection = () => {
    if (!template) return

    const newSection: FormSection = {
      id: nanoid(),
      title: "New Section",
      items: [],
    }

    setTemplate((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        sections: [...prev.sections, newSection],
      }
    })

    setActiveSection(newSection.id)
  }

  // Remove a section
  const removeSection = (sectionId: string) => {
    if (!template) return

    setTemplate((prev) => {
      if (!prev) return prev

      const newTemplate = { ...prev }
      const sectionIndex = newTemplate.sections.findIndex((s) => s.id === sectionId)

      if (sectionIndex !== -1) {
        newTemplate.sections.splice(sectionIndex, 1)

        // Set active section to first section if the active section was removed
        if (activeSection === sectionId && newTemplate.sections.length > 0) {
          setActiveSection(newTemplate.sections[0].id)
        }
      }

      return newTemplate
    })
  }

  // Add a new item to a section
  const addItem = (sectionId: string, type: "checkbox" | "text" | "select" | "photo") => {
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

    setTemplate((prev) => {
      if (!prev) return prev

      const newTemplate = { ...prev }
      const sectionIndex = newTemplate.sections.findIndex((s) => s.id === sectionId)

      if (sectionIndex !== -1) {
        newTemplate.sections[sectionIndex].items.push(newItem)
      }

      return newTemplate
    })
  }

  // Remove an item from a section
  const removeItem = (sectionId: string, itemId: string) => {
    if (!template) return

    setTemplate((prev) => {
      if (!prev) return prev

      const newTemplate = { ...prev }
      const sectionIndex = newTemplate.sections.findIndex((s) => s.id === sectionId)

      if (sectionIndex !== -1) {
        const itemIndex = newTemplate.sections[sectionIndex].items.findIndex((i) => i.id === itemId)

        if (itemIndex !== -1) {
          newTemplate.sections[sectionIndex].items.splice(itemIndex, 1)
        }
      }

      return newTemplate
    })
  }

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!template) return

    const { source, destination, type } = result

    // Dropped outside the list
    if (!destination) {
      return
    }

    // Reordering sections
    if (type === "section") {
      const newSections = Array.from(template.sections)
      const [removed] = newSections.splice(source.index, 1)
      newSections.splice(destination.index, 0, removed)

      setTemplate((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          sections: newSections,
        }
      })
    }
    // Reordering items within a section
    else if (type === "item") {
      const sectionId = source.droppableId
      const sectionIndex = template.sections.findIndex((s) => s.id === sectionId)

      if (sectionIndex !== -1) {
        const newItems = Array.from(template.sections[sectionIndex].items)
        const [removed] = newItems.splice(source.index, 1)
        newItems.splice(destination.index, 0, removed)

        setTemplate((prev) => {
          if (!prev) return prev

          const newTemplate = { ...prev }
          newTemplate.sections[sectionIndex].items = newItems

          return newTemplate
        })
      }
    }
  }

  // Save template
  const saveTemplate = async () => {
    if (!template) return

    setSaving(true)

    try {
      await upsertTemplate({
        tenantId,
        template,
      })

      setOriginalTemplate(JSON.parse(JSON.stringify(template)))

      toast({
        title: "Template Saved",
        description: "Assessment template has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Save Failed",
        description: "Failed to save assessment template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Reset template to original
  const resetTemplate = () => {
    if (originalTemplate) {
      setTemplate(JSON.parse(JSON.stringify(originalTemplate)))
    }
  }

  // Reset to default template
  const resetToDefault = () => {
    const defaultTemplate = createDefaultAssessmentTemplate()
    setTemplate(defaultTemplate)
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
        <h1 className="text-2xl font-bold">Assessment Form Template</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetTemplate} disabled={saving}>
            <Undo className="mr-2 h-4 w-4" />
            Discard Changes
          </Button>
          <Button variant="outline" onClick={resetToDefault} disabled={saving}>
            Reset to Default
          </Button>
          <Button onClick={saveTemplate} disabled={saving}>
            {saving ? (
              <>
                <Spinner className="mr-2" size="sm" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Section List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Sections</CardTitle>
            <CardDescription>Drag to reorder sections</CardDescription>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections" type="section">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {template.sections.map((section, index) => (
                      <Draggable key={section.id} draggableId={section.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`p-3 rounded-md flex items-center justify-between ${
                              activeSection === section.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary hover:bg-secondary/80"
                            }`}
                          >
                            <div className="flex items-center flex-1">
                              <div {...provided.dragHandleProps} className="mr-2">
                                <GripVertical className="h-4 w-4" />
                              </div>
                              <button
                                type="button"
                                className="flex-1 text-left"
                                onClick={() => setActiveSection(section.id)}
                              >
                                {section.title}
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSection(section.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <Button onClick={addSection} className="w-full mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </CardContent>
        </Card>

        {/* Section Editor */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Section Editor</CardTitle>
            <CardDescription>Edit section details and form fields</CardDescription>
          </CardHeader>
          <CardContent>
            {activeSection ? (
              <>
                {/* Active Section */}
                {template.sections.map(
                  (section) =>
                    section.id === activeSection && (
                      <div key={section.id} className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="section-title">Section Title</Label>
                          <Input
                            id="section-title"
                            value={section.title}
                            onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label>Form Fields</Label>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline" onClick={() => addItem(section.id, "checkbox")}>
                                Add Checkbox
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => addItem(section.id, "text")}>
                                Add Text Field
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => addItem(section.id, "select")}>
                                Add Select
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => addItem(section.id, "photo")}>
                                Add Photo
                              </Button>
                            </div>
                          </div>

                          <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId={section.id} type="item">
                              {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4 mt-4">
                                  {section.items.map((item, index) => (
                                    <Draggable key={item.id} draggableId={item.id} index={index}>
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          className="p-4 border rounded-md bg-card"
                                        >
                                          <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center">
                                              <div {...provided.dragHandleProps} className="mr-2">
                                                <GripVertical className="h-4 w-4" />
                                              </div>
                                              <span className="font-medium">
                                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Field
                                              </span>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => removeItem(section.id, item.id)}
                                              className="text-red-500 hover:text-red-700"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>

                                          <div className="space-y-4">
                                            <div>
                                              <Label htmlFor={`item-${item.id}-label`}>Field Label</Label>
                                              <Input
                                                id={`item-${item.id}-label`}
                                                value={item.label}
                                                onChange={(e) =>
                                                  handleItemChange(section.id, item.id, "label", e.target.value)
                                                }
                                              />
                                            </div>

                                            {item.type === "select" && (
                                              <div>
                                                <Label htmlFor={`item-${item.id}-options`}>
                                                  Options (one per line)
                                                </Label>
                                                <textarea
                                                  id={`item-${item.id}-options`}
                                                  className="w-full min-h-[100px] p-2 border rounded-md"
                                                  value={(item.options || []).join("\n")}
                                                  onChange={(e) =>
                                                    handleItemChange(
                                                      section.id,
                                                      item.id,
                                                      "options",
                                                      e.target.value.split("\n").filter((o) => o.trim() !== ""),
                                                    )
                                                  }
                                                />
                                              </div>
                                            )}

                                            {item.type === "checkbox" && (
                                              <div className="flex items-center space-x-2">
                                                <input
                                                  type="checkbox"
                                                  id={`item-${item.id}-default`}
                                                  checked={item.value === true}
                                                  onChange={(e) =>
                                                    handleItemChange(section.id, item.id, "value", e.target.checked)
                                                  }
                                                  className="h-4 w-4 rounded border-gray-300"
                                                />
                                                <Label htmlFor={`item-${item.id}-default`}>Default checked</Label>
                                              </div>
                                            )}

                                            {item.type === "text" && (
                                              <div>
                                                <Label htmlFor={`item-${item.id}-default`}>Default value</Label>
                                                <Input
                                                  id={`item-${item.id}-default`}
                                                  value={item.value || ""}
                                                  onChange={(e) =>
                                                    handleItemChange(section.id, item.id, "value", e.target.value)
                                                  }
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </DragDropContext>

                          {section.items.length === 0 && (
                            <div className="text-center p-8 border border-dashed rounded-md">
                              <p className="text-muted-foreground">No fields added yet. Add a field to get started.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                )}
              </>
            ) : (
              <div className="text-center p-8 border border-dashed rounded-md">
                <p className="text-muted-foreground">Select a section to edit or create a new one.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
