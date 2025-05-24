import { nanoid } from "nanoid"
import type { AssessmentForm } from "./formSchemas"

/**
 * Creates a default assessment form template with standard vehicle inspection sections
 * @returns A complete AssessmentForm object
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
            label: "Front bumper scratches or dents",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Rear bumper scratches or dents",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Driver side door scratches or dents",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Passenger side door scratches or dents",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Hood scratches or dents",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Roof scratches or dents",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Trunk/hatch scratches or dents",
            value: false,
          },
          {
            id: nanoid(),
            type: "select",
            label: "Windshield condition",
            options: ["No damage", "Minor chips", "Cracks present", "Needs replacement"],
            value: "No damage",
          },
          {
            id: nanoid(),
            type: "text",
            label: "Other exterior damage (please describe)",
            value: "",
          },
          {
            id: nanoid(),
            type: "photo",
            label: "Front view photo",
            value: null,
          },
          {
            id: nanoid(),
            type: "photo",
            label: "Rear view photo",
            value: null,
          },
          {
            id: nanoid(),
            type: "photo",
            label: "Driver side photo",
            value: null,
          },
          {
            id: nanoid(),
            type: "photo",
            label: "Passenger side photo",
            value: null,
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
            label: "Driver seat stains or tears",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Passenger seat stains or tears",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Rear seat stains or tears",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Dashboard scratches or damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Door panel scratches or damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Carpet stains or damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Headliner stains or damage",
            value: false,
          },
          {
            id: nanoid(),
            type: "text",
            label: "Other interior damage (please describe)",
            value: "",
          },
          {
            id: nanoid(),
            type: "photo",
            label: "Driver seat photo",
            value: null,
          },
          {
            id: nanoid(),
            type: "photo",
            label: "Passenger seat photo",
            value: null,
          },
          {
            id: nanoid(),
            type: "photo",
            label: "Rear seat photo",
            value: null,
          },
          {
            id: nanoid(),
            type: "photo",
            label: "Dashboard photo",
            value: null,
          },
        ],
      },
      {
        id: nanoid(),
        title: "Service Request",
        items: [
          {
            id: nanoid(),
            type: "select",
            label: "Requested service level",
            options: ["Basic Clean", "Standard Detail", "Premium Detail", "Full Restoration"],
            value: "Standard Detail",
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Interior deep cleaning needed",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Exterior paint correction needed",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Ceramic coating requested",
            value: false,
          },
          {
            id: nanoid(),
            type: "checkbox",
            label: "Leather treatment needed",
            value: false,
          },
          {
            id: nanoid(),
            type: "text",
            label: "Additional service requests",
            value: "",
          },
        ],
      },
      {
        id: nanoid(),
        title: "Customer Information",
        items: [
          {
            id: nanoid(),
            type: "text",
            label: "Full Name",
            value: "",
          },
          {
            id: nanoid(),
            type: "text",
            label: "Email Address",
            value: "",
          },
          {
            id: nanoid(),
            type: "text",
            label: "Phone Number",
            value: "",
          },
          {
            id: nanoid(),
            type: "text",
            label: "Preferred Contact Method",
            options: ["Email", "Phone", "Text Message"],
            value: "Email",
          },
          {
            id: nanoid(),
            type: "text",
            label: "Additional Comments",
            value: "",
          },
        ],
      },
    ],
  }
}
