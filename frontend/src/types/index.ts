export interface Room {
  id: number;
  name: string;
  capacity: number;
  amenities: string[];
}

export interface Booking {
  id: number;
  room_id: number;
  room_name?: string;
  title?: string;
  booked_by: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  created_at: string;
}

export interface BookingCreate {
  room_id: number;
  title?: string;
  booked_by: string;
  booking_date: string;
  start_time: string;
  end_time: string;
}

export interface AIParseResponse {
  room_name: string | null;
  room_requirements: { min_capacity: number } | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
  booked_by: string | null;
  title: string | null;
  confidence: "high" | "medium" | "low";
  clarification_needed: string | null;
  raw_text?: string;
}
