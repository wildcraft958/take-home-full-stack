import axios from 'axios';
import { Room, Booking, BookingCreate, AIParseResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch all available rooms from the API.
 */
export const fetchRooms = async (): Promise<Room[]> => {
  const response = await api.get('/rooms');
  return response.data;
};

/**
 * Fetch bookings with optional filters.
 * @param roomId Optional room ID to filter by
 * @param date Optional date string (YYYY-MM-DD) to filter by
 */
export const fetchBookings = async (roomId?: number, date?: string): Promise<Booking[]> => {
  const params: any = {};
  if (roomId) params.room_id = roomId;
  if (date) params.booking_date = date;
  const response = await api.get('/bookings', { params });
  return response.data;
};

/**
 * Submit a new booking request.
 */
export const submitBooking = async (booking: BookingCreate): Promise<Booking> => {
  const response = await api.post('/bookings', booking);
  return response.data;
};

export const cancelBooking = async (id: number): Promise<void> => {
  await api.delete(`/bookings/${id}`);
};

export const analyzeBookingRequest = async (text: string): Promise<AIParseResponse> => {
  const response = await api.post('/bookings/parse', null, {
    params: { text },
  });
  return response.data;
};
