import axios from 'axios'

/**
 * Pre-configured Axios instance for API calls
 *
 * The base URL is set to work with the Docker setup.
 * All API endpoints are prefixed with /api
 *
 * Usage:
 *   import { api } from './api/client'
 *
 *   // GET request
 *   const rooms = await api.get('/api/rooms')
 *
 *   // POST request
 *   const newBooking = await api.post('/api/bookings', {
 *     room_id: 1,
 *     booking_date: '2024-01-15',
 *     start_time: '09:00',
 *     end_time: '10:00',
 *     booked_by: 'john@example.com'
 *   })
 *
 *   // DELETE request
 *   await api.delete('/api/bookings/1')
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract error message from response
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'

    // You can handle specific status codes here
    if (error.response?.status === 409) {
      // Conflict - likely a double-booking
      console.error('Booking conflict:', message)
    }

    return Promise.reject(new Error(message))
  }
)

// Type-safe API helper functions (optional, but recommended)
// Uncomment and modify once you define your types

/*
import { Room, Booking, BookingCreate } from '../types'

export const roomsApi = {
  getAll: () => api.get<Room[]>('/api/rooms'),
  getById: (id: number) => api.get<Room>(`/api/rooms/${id}`),
}

export const bookingsApi = {
  getAll: (params?: { room_id?: number; booking_date?: string }) =>
    api.get<Booking[]>('/api/bookings', { params }),
  getById: (id: number) => api.get<Booking>(`/api/bookings/${id}`),
  create: (data: BookingCreate) => api.post<Booking>('/api/bookings', data),
  delete: (id: number) => api.delete(`/api/bookings/${id}`),
}
*/
