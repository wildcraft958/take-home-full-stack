/**
 * TypeScript Type Definitions
 *
 * Define your types here to match the API schemas.
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
  title?: string
  booked_by: string
  booking_date: string
  start_time: string
  end_time: string
  created_at: string
}

export interface BookingWithRoom extends Booking {
  room: Room
}

export interface CreateBookingRequest {
  room_id: number
  title?: string
  booked_by: string
  booking_date: string // YYYY-MM-DD
  start_time: string   // HH:MM
  end_time: string     // HH:MM
}

// ============ AI Parsing Types ============

export interface ParseBookingRequest {
  text: string
}

export interface ParsedBooking {
  room_name: string | null
  room_requirements: {
    min_capacity?: number
  } | null
  date: string | null          // YYYY-MM-DD
  start_time: string | null    // HH:MM
  end_time: string | null      // HH:MM
  duration_minutes: number | null
  booked_by: string | null
  title: string | null
  confidence: 'high' | 'medium' | 'low'
  clarification_needed: string | null
  raw_text: string
}

// ============ API Response Types ============

export interface ApiError {
  detail: string
}

export interface BookingConflictError extends ApiError {
  existing_booking?: Booking
}

// ============ Component Props Types ============

export interface RoomCardProps {
  room: Room
  onSelect?: (room: Room) => void
  selected?: boolean
}

export interface BookingCardProps {
  booking: BookingWithRoom
  onCancel?: (id: number) => void
}

export interface NaturalLanguageInputProps {
  onParsed: (result: ParsedBooking) => void
  onError: (error: string) => void
  isLoading?: boolean
}

export interface BookingFormProps {
  rooms: Room[]
  initialData?: Partial<CreateBookingRequest>
  onSubmit: (booking: CreateBookingRequest) => void
  isLoading?: boolean
}

export interface ParsedBookingPreviewProps {
  parsed: ParsedBooking
  rooms: Room[]
  onConfirm: (booking: CreateBookingRequest) => void
  onEdit: () => void
  onCancel: () => void
}
