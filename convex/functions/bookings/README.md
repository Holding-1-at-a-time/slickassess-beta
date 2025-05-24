# Booking Functions Documentation

## Overview

This directory contains Convex functions for managing bookings with Google Calendar integration.

## Functions

### create.ts

Creates a new booking and syncs with Google Calendar.

**Type**: Mutation

**Arguments**:
- `tenantId` (string): Tenant identifier
- `vehicleId` (string): Vehicle identifier
- `serviceType` (string): Type of service
- `startTime` (string): ISO format start time
- `endTime` (string): ISO format end time
- `notes` (string, optional): Additional notes
- `customerEmail` (string, optional): Customer email
- `customerName` (string, optional): Customer name
- `customerPhone` (string, optional): Customer phone

**Returns**:
\`\`\`typescript
{
  bookingId: string,
  googleEventId: string
}
\`\`\`

**Errors**:
- Throws if Google Calendar sync fails
- Throws if required fields are missing

### update.ts

Updates an existing booking and syncs changes with Google Calendar.

**Type**: Mutation

**Arguments**:
- `bookingId` (Id<"bookings">): Booking ID
- `updates` (object): Fields to update
  - `serviceType` (string, optional)
  - `startTime` (string, optional)
  - `endTime` (string, optional)
  - `status` (string, optional): "confirmed" | "pending" | "canceled"
  - `notes` (string, optional)

**Returns**:
\`\`\`typescript
{ success: boolean }
\`\`\`

**Errors**:
- Throws if booking not found
- Throws if Google Calendar sync fails

### delete.ts

Deletes a booking and removes the associated Google Calendar event.

**Type**: Mutation

**Arguments**:
- `bookingId` (Id<"bookings">): Booking ID to delete

**Returns**:
\`\`\`typescript
{ success: boolean }
\`\`\`

**Errors**:
- Throws if booking not found
- Throws if Google Calendar deletion fails

### fetchAvailableSlots.ts

Fetches available time slots from Google Calendar.

**Type**: Action

**Arguments**:
- `startDate` (string): Start date in ISO format
- `endDate` (string): End date in ISO format
- `duration` (number): Slot duration in minutes

**Returns**:
\`\`\`typescript
Array<{
  startTime: string,
  endTime: string
}>
\`\`\`

**Business Rules**:
- Excludes weekends
- Business hours: 9 AM - 5 PM
- 30-minute slot increments

### sendReminders.ts

Sends email reminders for upcoming bookings.

**Type**: Internal Action

**Arguments**: None (scheduled function)

**Returns**:
\`\`\`typescript
{
  success: boolean,
  remindersSent: number
}
\`\`\`

**Behavior**:
- Runs daily
- Sends reminders for next day's bookings
- Only sends to bookings with customer email

### updateFromCalendarEvent.ts

Updates a booking based on changes in Google Calendar.

**Type**: Internal Action

**Arguments**:
- `eventId` (string): Google Calendar event ID

**Returns**:
\`\`\`typescript
{
  success: boolean,
  reason?: string
}
\`\`\`

**Behavior**:
- Called by webhook when calendar events change
- Updates booking times and status
- Handles event cancellations

## Queries

### listByDateRange.ts

Lists bookings within a date range.

**Type**: Query

**Arguments**:
- `startDate` (string): Start date filter
- `endDate` (string): End date filter
- `status` (string, optional): Status filter
- `tenantId` (string, optional): Tenant filter

**Returns**: Array of booking documents

### getByGoogleEventId.ts

Finds bookings by Google Calendar event ID.

**Type**: Query

**Arguments**:
- `googleEventId` (string): Google Calendar event ID

**Returns**: Array of matching bookings

## Error Handling

All functions implement comprehensive error handling:

1. **Validation Errors**: Invalid input parameters
2. **Not Found Errors**: Resources don't exist
3. **External Service Errors**: Google Calendar API failures
4. **Configuration Errors**: Missing environment variables

Errors are logged with context but don't expose sensitive information.

## Testing

Each function should be tested for:
- Happy path scenarios
- Input validation
- Error conditions
- Google Calendar integration
- Edge cases (e.g., overlapping bookings)
\`\`\`

## 9. Add component documentation:
