"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, GripVertical, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { nanoid } from "nanoid"

interface Field {
  id: string
  label: string
  type: "text" | "number" | "select" | "textarea" | "checkbox"
  required: boolean
  options?: string[]
  placeholder?: string
}

interface Section {
  id: string
  title: string
  description?: string
  fields: Field[]
}

interface AssessmentTemplate {
  id: string
  name: string
  description?: string
  sections: Section[]
  isActive: boolean
}

export default function AssessmentTemplatePage() {
  const params = useParams()
  const tenantId = params.tenantId as string
  const { toast } = useToast()

  const [template, setTemplate] = useState<AssessmentTemplate>({
    id: nanoid(),
    name: "Vehicle Assessment Template",
    description: "Standard template for vehicle assessments",
    sections: [],
    isActive: true,
  })

  const [isSaving, setIsSaving] = useState(false)

  // Load template on mount
  useEffect(() => {
    loadTemplate()
  }, [tenantId])

  const loadTemplate = async () => {
    try {
      // TODO: Load template from API
      // For now, use a default template
      setTemplate({
        id: nanoid(),
        name: "Vehicle Assessment Template",
        description: "Standard template for vehicle assessments",
        sections: [
          {
            id: nanoid(),
            title: "Customer Information",
            description: "Basic customer details",
            fields: [
              {
                id: nanoid(),
                label: "Full Name",
                type: "text",
                required: true,
                placeholder: "Enter customer name",
              },
              {
                id: nanoid(),
                label: "Email",
                type: "text",
                required: true,
                placeholder: "customer@example.com",
              },
              {
                id: nanoid(),
                label: "Phone",
                type: "text",
                required: true,
                placeholder: "(555) 123-4567",
              },
              {
                id: nanoid(),
                label: "Preferred Contact Method",
                type: "select",
                required: false,
                options: ["Email", "Phone", "Text"],
              },
            ],
          },
          {
            id: nanoid(),
            title: "Vehicle Information",
            description: "Details about the vehicle",
            fields: [
              {
                id: nanoid(),
                label: "Make",
                type: "text",
                required: true,
                placeholder: "e.g., Toyota",
              },
              {
                id: nanoid(),
                label: "Model",
                type: "text",
                required: true,
                placeholder: "e.g., Camry",
              },
              {
                id: nanoid(),
                label: "Year",
                type: "number",
                required: true,
                placeholder: "e.g., 2022",
              },
              {
                id: nanoid(),
                label: "VIN",
                type: "text",
                required: false,
                placeholder: "Vehicle Identification Number",
              },
              {
                id: nanoid(),
                label: "Mileage",
                type: "number",
                required: true,
                placeholder: "Current mileage",
              },
            ],
          },
        ],
        isActive: true,
      })
    } catch (error) {
      console.error("Error loading template:", error)
      toast({
        title: "Error",
        description: "Failed to load assessment template",
        variant: "destructive",
      })
    }
  }

  const saveTemplate = async () => {
    setIsSaving(true)
    try {
      // TODO: Save template to API
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call

      toast({
        title: "Success",
        description: "Assessment template saved successfully",
      })
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to save assessment template",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateTemplateName = (name: string) => {
    setTemplate((prev) => ({ ...prev, name }))
  }

  const updateTemplateDescription = (description: string) => {
    setTemplate((prev) => ({ ...prev, description }))
  }

  const toggleTemplateActive = (isActive: boolean) => {
    setTemplate((prev) => ({ ...prev, isActive }))
  }

  const addSection = () => {
    const newSection: Section = {
      id: nanoid(),
      title: "New Section",
      description: "",
      fields: [],
    }
    setTemplate((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))
  }

  const removeSection = (sectionId: string) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }))
  }

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
    }))
  }

  const addField = (sectionId: string) => {
    const newField: Field = {
      id: nanoid(),
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "",
    }
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, fields: [...section.fields, newField] } : section,
      ),
    }))
  }

  const removeField = (sectionId: string, fieldId: string) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.filter((field) => field.id !== fieldId),
            }
          : section,
      ),
    }))
  }

  const updateField = (sectionId: string, fieldId: string, updates: Partial<Field>) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) => (field.id === fieldId ? { ...field, ...updates } : field)),
            }
          : section,
      ),
    }))
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Assessment Template</h1>
          <p className="text-muted-foreground">Customize the fields and sections for vehicle assessments</p>
        </div>
        <Button onClick={saveTemplate} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Template"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Settings</CardTitle>
          <CardDescription>Configure the basic settings for this assessment template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={template.name}
              onChange={(e) => updateTemplateName(e.target.value)}
              placeholder="Enter template name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={template.description || ""}
              onChange={(e) => updateTemplateDescription(e.target.value)}
              placeholder="Enter template description"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="template-active" checked={template.isActive} onCheckedChange={toggleTemplateActive} />
            <Label htmlFor="template-active">Active Template</Label>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Sections</h2>
          <Button onClick={addSection} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </div>

        {template.sections.map((section, sectionIndex) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="font-semibold"
                    placeholder="Section Title"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeSection(section.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                value={section.description || ""}
                onChange={(e) => updateSection(section.id, { description: e.target.value })}
                placeholder="Section description (optional)"
                className="mt-2"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields.map((field, fieldIndex) => (
                <div key={field.id} className="flex items-start space-x-2 p-4 border rounded-lg">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move mt-2" />
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Field Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) =>
                            updateField(section.id, field.id, {
                              label: e.target.value,
                            })
                          }
                          placeholder="Field label"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Field Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) =>
                            updateField(section.id, field.id, {
                              type: value as Field["type"],
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="textarea">Text Area</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Placeholder</Label>
                        <Input
                          value={field.placeholder || ""}
                          onChange={(e) =>
                            updateField(section.id, field.id, {
                              placeholder: e.target.value,
                            })
                          }
                          placeholder="Placeholder text"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) =>
                            updateField(section.id, field.id, {
                              required: checked,
                            })
                          }
                        />
                        <Label>Required</Label>
                      </div>
                    </div>
                    {field.type === "select" && (
                      <div className="space-y-2">
                        <Label>Options (comma-separated)</Label>
                        <Input
                          value={field.options?.join(", ") || ""}
                          onChange={(e) =>
                            updateField(section.id, field.id, {
                              options: e.target.value
                                .split(",")
                                .map((opt) => opt.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeField(section.id, field.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addField(section.id)} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Field
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
