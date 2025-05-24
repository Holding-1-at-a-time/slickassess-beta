"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"

interface Field {
  id: string
  label: string
  type: "text" | "number" | "select"
  options?: string[]
}

interface Section {
  id: string
  title: string
  fields: Field[]
}

interface AssessmentTemplate {
  id: string
  name: string
  sections: Section[]
}

const AssessmentTemplatePage = () => {
  const [template, setTemplate] = useState<AssessmentTemplate>({
    id: uuidv4(),
    name: "New Assessment Template",
    sections: [],
  })

  useEffect(() => {
    // Load template from API or local storage if needed
    // Example:
    // const savedTemplate = localStorage.getItem('assessmentTemplate');
    // if (savedTemplate) {
    //   setTemplate(JSON.parse(savedTemplate));
    // }
  }, [])

  useEffect(() => {
    // Save template to API or local storage whenever it changes
    // Example:
    // localStorage.setItem('assessmentTemplate', JSON.stringify(template));
  }, [template])

  const addSection = () => {
    const newSection: Section = {
      id: uuidv4(),
      title: "New Section",
      fields: [],
    }
    setTemplate((prev) => ({ ...prev, sections: [...prev.sections, newSection] }))
  }

  const removeSection = (sectionId: string) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }))
  }

  const addField = (sectionId: string) => {
    const newField: Field = {
      id: uuidv4(),
      label: "New Field",
      type: "text",
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
          ? { ...section, fields: section.fields.filter((field) => field.id !== fieldId) }
          : section,
      ),
    }))
  }

  const updateSectionTitle = (sectionId: string, newTitle: string) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === sectionId ? { ...section, title: newTitle } : section)),
    }))
  }

  const updateFieldName = (sectionId: string, fieldId: string, newLabel: string) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) => (field.id === fieldId ? { ...field, label: newLabel } : field)),
            }
          : section,
      ),
    }))
  }

  const updateFieldType = (sectionId: string, fieldId: string, newType: "text" | "number" | "select") => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) => (field.id === fieldId ? { ...field, type: newType } : field)),
            }
          : section,
      ),
    }))
  }

  const updateFieldOptions = (sectionId: string, fieldId: string, newOptions: string) => {
    setTemplate((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              fields: section.fields.map((field) =>
                field.id === fieldId ? { ...field, options: newOptions.split(",") } : field,
              ),
            }
          : section,
      ),
    }))
  }

  const updateTemplateName = (newName: string) => {
    setTemplate((prev) => ({ ...prev, name: newName }))
  }

  return (
    <div>
      <h1>Assessment Template</h1>
      <label htmlFor="templateName">Template Name:</label>
      <input type="text" id="templateName" value={template.name} onChange={(e) => updateTemplateName(e.target.value)} />
      <button onClick={addSection}>Add Section</button>
      {template.sections.map((section) => (
        <div key={section.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
          <label htmlFor={`sectionTitle-${section.id}`}>Section Title:</label>
          <input
            type="text"
            id={`sectionTitle-${section.id}`}
            value={section.title}
            onChange={(e) => updateSectionTitle(section.id, e.target.value)}
          />
          <button onClick={() => removeSection(section.id)}>Remove Section</button>
          <button onClick={() => addField(section.id)}>Add Field</button>
          {section.fields.map((field) => (
            <div key={field.id} style={{ border: "1px solid #eee", margin: "5px", padding: "5px" }}>
              <label htmlFor={`fieldName-${field.id}`}>Field Name:</label>
              <input
                type="text"
                id={`fieldName-${field.id}`}
                value={field.label}
                onChange={(e) => updateFieldName(section.id, field.id, e.target.value)}
              />
              <label htmlFor={`fieldType-${field.id}`}>Field Type:</label>
              <select
                id={`fieldType-${field.id}`}
                value={field.type}
                onChange={(e) => updateFieldType(section.id, field.id, e.target.value as "text" | "number" | "select")}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="select">Select</option>
              </select>
              {field.type === "select" && (
                <>
                  <label htmlFor={`fieldOptions-${field.id}`}>Options (comma-separated):</label>
                  <input
                    type="text"
                    id={`fieldOptions-${field.id}`}
                    value={field.options ? field.options.join(",") : ""}
                    onChange={(e) => updateFieldOptions(section.id, field.id, e.target.value)}
                  />
                </>
              )}
              <button onClick={() => removeField(section.id, field.id)}>Remove Field</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default AssessmentTemplatePage
