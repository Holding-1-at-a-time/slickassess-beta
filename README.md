# SlickAssess Booking System

This implementation provides a complete booking system with Google Calendar integration, AI-powered chatbot, and automated reminders.

## Features

- Google Calendar integration for managing bookings
- AI-powered chatbot for booking services
- Real-time calendar view of all bookings
- Automated email reminders for upcoming appointments
- Webhook support for external calendar updates

## Setup Instructions

### 1. Google Cloud Setup

1. Create a Google Cloud project
2. Enable the Google Calendar API and Gmail API
3. Create a Service Account with the following permissions:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/gmail.send`
4. Generate and download a JSON key for the service account
5. Create a Google Calendar for your bookings or use an existing one

### 2. Environment Variables

Copy the `.env.example` file to `.env.local` and fill in the values:

\`\`\`
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
NEXT_PUBLIC_CONVEX_URL=your-convex-deployment-url
NEXT_PUBLIC_BASE_URL=http://localhost:3000
\`\`\`

### 3. Convex Setup

1. Initialize your Convex project if not already done:
   \`\`\`
   npx convex init
   \`\`\`

2. Deploy your Convex functions:
   \`\`\`
   npx convex push
   \`\`\`

### 4. Set Up Calendar Webhook

1. Deploy your application to a public URL (or use a tool like ngrok for local development)
2. Set up the webhook by visiting:
   \`\`\`
   https://your-domain.com/api/google/calendar/setup-webhook
   \`\`\`
   This will register your webhook with Google Calendar

## Usage

1. Navigate to the booking page: `/{tenantId}/dashboard/bookings/new`
2. Use the AI chatbot to book a service by following the prompts
3. Alternatively, use the Calendar view to see available slots and existing bookings
4. View all bookings on the bookings page: `/{tenantId}/dashboard/bookings`

## Components

### BookingChatbot

The `BookingChatbot` component provides an AI-powered interface for booking services. It guides users through the booking process by asking for:

- Service type
- Preferred date
- Time slot selection
- Booking confirmation

### BookingCalendar

The `BookingCalendar` component displays a calendar view of all bookings with color-coding based on status:

- Green: Confirmed
- Yellow: Pending
- Red: Canceled
- Purple: Completed
- Gray: No-show

## Automated Reminders

The system automatically sends email reminders for bookings scheduled for the next day. This is handled by a Convex scheduled function that runs daily at 8 AM UTC.

## Webhook Integration

The webhook endpoint at `/api/google/calendar/webhook` receives notifications from Google Calendar when events are created, updated, or deleted. This ensures that your booking system stays in sync with external calendar changes.

## Extending the System

### Adding SMS Reminders

To add SMS reminders, you can integrate with a service like Twilio:

1. Install the Twilio SDK: `npm install twilio`
2. Create a Twilio client in `lib/twilioClient.ts`
3. Update the `sendBookingReminders` function to send SMS notifications

### Supporting Multiple Staff Calendars

To support multiple staff members with their own calendars:

1. Store staff calendar IDs in your database
2. Modify the `fetchAvailableSlots` function to check availability across all calendars
3. Update the booking creation to assign to the appropriate staff member

## Troubleshooting

- **Webhook not receiving events**: Ensure your webhook URL is publicly accessible and the service account has the correct permissions
- **Calendar events not syncing**: Check that the calendar ID is correct and the service account has access to it
- **Reminders not sending**: Verify that the Gmail API is enabled and the service account has the necessary permissions
