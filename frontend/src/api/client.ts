/**
 * API Client Configuration
 *
 * Pre-configured Axios instance for communicating with the backend.
 * The base URL is set via environment variable VITE_API_URL.
 */

import axios from 'axios'

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor (add auth tokens, logging, etc.)
api.interceptors.request.use(
  (config) => {
    // TODO: Add auth token if needed
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor (handle errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      switch (error.response.status) {
        case 409:
          // Booking conflict
          console.error('Booking conflict:', error.response.data.detail)
          break
        case 404:
          console.error('Resource not found:', error.response.data.detail)
          break
        case 422:
          console.error('Validation error:', error.response.data.detail)
          break
        default:
          console.error('API error:', error.response.data)
      }
    } else if (error.request) {
      console.error('Network error - no response received')
    }
    return Promise.reject(error)
  }
)

// =============================================================================
// API Functions - Implement these as needed
// =============================================================================

/**
 * Fetch all rooms
 * GET /api/rooms
 */
export const getRooms = async () => {
  const response = await api.get('/api/rooms')
  return response.data
}

/**
 * Fetch all bookings with optional filters
 * GET /api/bookings?room_id=X&booking_date=YYYY-MM-DD
 */
export const getBookings = async (params?: {
  room_id?: number
  booking_date?: string
}) => {
  const response = await api.get('/api/bookings', { params })
  return response.data
}

/**
 * Create a new booking
 * POST /api/bookings
 */
export const createBooking = async (booking: {
  room_id: number
  title?: string
  booked_by: string
  booking_date: string
  start_time: string
  end_time: string
}) => {
  const response = await api.post('/api/bookings', booking)
  return response.data
}

/**
 * Delete a booking
 * DELETE /api/bookings/:id
 */
export const deleteBooking = async (id: number) => {
  await api.delete(`/api/bookings/${id}`)
}

/**
 * Parse natural language booking request using AI
 * POST /api/bookings/parse
 */
export const parseBookingRequest = async (text: string) => {
  const response = await api.post('/api/bookings/parse', { text })
  return response.data
}

export default api
