import { nanoid } from "nanoid"
import type { AssessmentForm } from "./formSchemas"

/**
 * Creates a default assessment template that can be customized by tenants
 * @returns A default assessment form template
 */
export function createDefaultAssessmentTemplate(): AssessmentForm {
  return {
    sections: [
      {
        id: nanoid(),
        title: "Vehicle Exterior",
        items: [
          {
            id: nanoid(),
            type: "checkbox",
            label: "Front bumper damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Rear bumper damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Driver side door damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Passenger side door damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Hood damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Roof damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Trunk/hatch damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "select",
            label: "Windshield condition",
            options: ["No damage", "Minor chips", "Cracks", "Needs replacement"],
            value: "No damage",
          },
          {
            id: nanoid(),
            type: "photo",
            label: "Front view photos",
          },
          {
            id: nanoid(),
            type: "photo",
            label: "Rear view photos",
          },
          {
            id: nanoid(),
            type: "photo",
            label: "Driver side photos",
          },
          {
            id: nanoid(),
            type: "photo",
            label: "Passenger side photos",
          },
        ],
      },
      {
        id: nanoid(),
        title: "Vehicle Interior",
        items: [
          {
            id: nanoid(),
            type: "checkbox",
            label: "Driver seat damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Passenger seat damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Rear seat damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Dashboard damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Carpet/floor damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "text",
            label: "Additional interior issues",
            value: "",
          },
          {
            id: nanoid(),
            type: "photo",
            label: "Interior photos",
          },
        ],
      },
      {
        id: nanoid(),
        title: "Additional Information",
        items: [
          {
            id: nanoid(),
            type: "text",
            label: "Customer notes",
            value: "",
          },
          {
            id: nanoid(),
            type: "select",
            label: "Preferred contact method",
            options: ["Email", "Phone", "Text message"],
            value: "Email",
          },
          {
            id: nanoid(),
            type: "text",
            label: "Contact information",
            value: "",
          },
        ],
      },
    ],
  }
}
