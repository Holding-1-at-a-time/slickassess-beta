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

export const internal = {
  mutations: {
    analyzeImages: "analyzeImages" as any,
    updateAssessmentAIAnalysis: "updateAssessmentAIAnalysis" as any,
    runMigration: "runMigration" as any,
    rollbackMigration: "rollbackMigration" as any,
    getPendingMigrations: "getPendingMigrations" as any,
    createStream: "createStream" as any,
    appendToStream: "appendToStream" as any,
    generateThumbnail: "generateThumbnail" as any,
    cleanupExpiredFiles: "cleanupExpiredFiles" as any,
    cleanupOldData: "cleanupOldData" as any,
    dailyMaintenance: "dailyMaintenance" as any,
    weeklyReports: "weeklyReports" as any,
    syncExternalData: "syncExternalData" as any,
    scheduleBackgroundTasks: "scheduleBackgroundTasks" as any,
  },
  queries: {
    getStream: "getStream" as any,
  },
  actions: {
    batchProcess: "batchProcess" as any,
  },
}
