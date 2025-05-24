# Chat API Documentation

## Overview

The Chat API provides an AI-powered booking assistant that can help users schedule appointments and check availability.

## Endpoint

`POST /api/chat`

## Request

### Headers
- `Content-Type: application/json`

### Body
\`\`\`json
{
  "messages": [
    {
      "role": "user" | "assistant",
      "content": "string"
    }
  ],
  "tenantId": "string",
  "vehicleId": "string" (optional)
}
\`\`\`

### Parameters

- `messages` (required): Array of chat messages
  - `role`: Either "user" or "assistant"
  - `content`: The message content
- `tenantId` (required): The tenant ID for the booking
- `vehicleId` (optional): Pre-selected vehicle ID

## Response

The API returns a streaming response using Server-Sent Events (SSE) format.

### Success Response
- Status: 200
- Content-Type: text/event-stream

### Error Responses

#### 400 Bad Request
\`\`\`json
{
  "error": "Invalid messages format"
}
\`\`\`

#### 500 Internal Server Error
\`\`\`json
{
  "error": "Internal server error"
}
\`\`\`

#### 503 Service Unavailable
Redirects to `/api/chat/fallback` when AI service is unavailable

## Available Tools

The AI assistant has access to the following tools:

### 1. fetchAvailableSlots
Fetches available time slots for booking.

Parameters:
- `startDate` (string): Start date in ISO format
- `endDate` (string): End date in ISO format
- `duration` (number): Duration in minutes

### 2. createBooking
Creates a new booking.

Parameters:
- `tenantId` (string): Tenant ID
- `vehicleId` (string): Vehicle ID
- `serviceType` (string): Type of service
- `startTime` (string): Start time in ISO format
- `endTime` (string): End time in ISO format
- `notes` (string, optional): Additional notes
- `customerEmail` (string, optional): Customer email
- `customerName` (string, optional): Customer name
- `customerPhone` (string, optional): Customer phone

## Example Usage

\`\`\`javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      {
        role: 'user',
        content: 'I need to schedule an oil change for tomorrow'
      }
    ],
    tenantId: 'tenant-123',
    vehicleId: 'vehicle-456'
  })
})

// Handle streaming response
const reader = response.body.getReader()
// ... process stream
\`\`\`

## Error Handling

The API implements comprehensive error handling:

- Input validation errors return 400 status
- Service unavailability triggers fallback mechanism
- All errors are logged without exposing sensitive information
\`\`\`

## 8. Add documentation for Convex functions:
