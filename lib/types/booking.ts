export interface BookingSlot {
  startTime: string
  endTime: string
  available: boolean
}

export interface BookingRequest {
  serviceType: string
  vehicleId: string
  duration: number // in minutes
  preferredDate?: string
  preferredTimeRange?: {
    start: string
    end: string
  }
  notes?: string
}

export interface Booking {
  id: string
  tenantId: string
  vehicleId: string
  serviceType: string
  startTime: string
  endTime: string
  status: "confirmed" | "pending" | "canceled"
  notes?: string
  googleEventId?: string
}
