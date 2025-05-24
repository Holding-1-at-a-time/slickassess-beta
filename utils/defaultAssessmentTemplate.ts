const defaultAssessmentTemplate = [
  {
    id: "firstName",
    label: "First Name",
    type: "text",
    required: true,
  },
  {
    id: "lastName",
    label: "Last Name",
    type: "text",
    required: true,
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    required: true,
  },
  {
    id: "phone",
    label: "Phone Number",
    type: "tel",
    required: false,
  },
  {
    id: "address",
    label: "Address",
    type: "text",
    required: false,
  },
  {
    id: "city",
    label: "City",
    type: "text",
    required: false,
  },
  {
    id: "state",
    label: "State",
    type: "text",
    required: false,
  },
  {
    id: "zip",
    label: "Zip Code",
    type: "text",
    required: false,
  },
  {
    id: "preferredContactMethod",
    label: "Preferred Contact Method",
    type: "select",
    required: false,
    options: ["Phone", "Email", "Text Message"],
  },
  {
    id: "notes",
    label: "Notes",
    type: "textarea",
    required: false,
  },
]

export default defaultAssessmentTemplate
