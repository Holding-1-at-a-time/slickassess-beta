// Create a type-safe object that contains all API functions
export const api = {
  queries: {
    listBookingsByDateRange: "listBookingsByDateRange" as any,
    getBookingByGoogleEventId: "getBookingByGoogleEventId" as any,
  },
  mutations: {
    createBooking: "createBooking" as any,
    updateBooking: "updateBooking" as any,
    deleteBooking: "deleteBooking" as any,
  },
  actions: {
    fetchAvailableSlots: "fetchAvailableSlots" as any,
    updateBookingFromCalendarEvent: "updateBookingFromCalendarEvent" as any,
    sendBookingReminders: "sendBookingReminders" as any,
  },
}
