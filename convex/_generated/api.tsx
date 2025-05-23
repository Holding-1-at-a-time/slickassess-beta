// Create a type-safe object that contains all API functions
export const api = {
  queries: {
    listBookingsByDateRange: "queries:listBookingsByDateRange",
    getBookingByGoogleEventId: "queries:getBookingByGoogleEventId",
  },
  mutations: {
    createBooking: "mutations:createBooking",
    updateBooking: "mutations:updateBooking",
    deleteBooking: "mutations:deleteBooking",
  },
  actions: {
    fetchAvailableSlots: "actions:fetchAvailableSlots",
    updateBookingFromCalendarEvent: "actions:updateBookingFromCalendarEvent",
    sendBookingReminders: "actions:sendBookingReminders",
  },
}

// Export a type representing the Convex API
export type Api = typeof api
