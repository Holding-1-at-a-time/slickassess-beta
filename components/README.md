# UI Components Documentation

## BookingChatbot

An AI-powered chatbot component for booking appointments.

### Props

\`\`\`typescript
interface BookingChatbotProps {
  tenantId: string      // Required tenant identifier
  vehicleId?: string    // Optional pre-selected vehicle
}
\`\`\`

### Usage

\`\`\`tsx
import { BookingChatbot } from '@/components/BookingChatbot'

<BookingChatbot 
  tenantId="tenant-123" 
  vehicleId="vehicle-456" 
/>
\`\`\`

### Features

- Real-time chat interface
- AI-powered responses using Together AI
- Automatic booking creation
- Availability checking
- Mobile responsive

### Styling

The component uses shadcn/ui components and can be customized via:
- CSS variables for theming
- Tailwind classes for layout
- Component variants

## BookingCalendar

A calendar component for viewing and managing bookings.

### Props

\`\`\`typescript
interface BookingCalendarProps {
  tenantId: string      // Required tenant identifier
}
\`\`\`

### Usage

\`\`\`tsx
import { BookingCalendar } from '@/components/BookingCalendar'

<BookingCalendar tenantId="tenant-123" />
\`\`\`

### Features

- Day/Week/Month views
- Color-coded booking status
- Responsive design
- Mock data for development

### Event Status Colors

- **Confirmed**: Green (#10b981)
- **Pending**: Yellow (#f59e0b)
- **Canceled**: Red (#ef4444)

### Dependencies

- react-big-calendar
- moment
- shadcn/ui components

## Error Handling

Both components implement error boundaries and graceful degradation:

1. **Network Errors**: Show retry options
2. **Invalid Props**: Console warnings in development
3. **Missing Dependencies**: Fallback UI

## Accessibility

Components follow WCAG 2.1 guidelines:

- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management
- Color contrast compliance

## Testing

Components should be tested for:

1. **Unit Tests**: Props, state, methods
2. **Integration Tests**: API interactions
3. **Visual Tests**: Different viewports
4. **Accessibility Tests**: Screen readers, keyboard
\`\`\`

## 10. Add Jest configuration:
