/**
 * TypeScript Type Definitions
 *
 * Define your types here to match the API response shapes.
 * These should mirror the Pydantic schemas in the backend.
 */

// ============ Room Types ============

export interface Room {
  id: number
  name: string
  capacity: number
  amenities: string[]
  created_at: string
}

// ============ Booking Types ============

export interface Booking {
  id: number
  room_id: number
  title: string | null
  booked_by: string
  booking_date: string // ISO date string: "2024-01-15"
  start_time: string // Time string: "09:00:00"
  end_time: string // Time string: "10:00:00"
  created_at: string
}

export interface BookingWithRoom extends Booking {
  room: Room
}

export interface BookingCreate {
  room_id: number
  title?: string
  booked_by: string
  booking_date: string
  start_time: string
  end_time: string
}

// ============ API Response Types ============

export interface ApiError {
  detail: string
}

// ============ Component Props Types ============

// Add your component prop types here as needed
// Example:

/*
export interface RoomCardProps {
  room: Room
  onSelect?: (room: Room) => void
}

export interface BookingFormProps {
  rooms: Room[]
  onSubmit: (booking: BookingCreate) => Promise<void>
  onCancel?: () => void
}

export interface BookingListProps {
  bookings: BookingWithRoom[]
  onDelete: (id: number) => Promise<void>
}
*/
