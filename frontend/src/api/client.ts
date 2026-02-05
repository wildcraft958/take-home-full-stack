import axios from 'axios';
import { Room, Booking, BookingCreate, AIParseResponse } from '../types';

const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return url.endsWith('/api') ? url : `${url}/api`;
};

const API_URL = getApiUrl();

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

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ConversationResponse {
  message: string;
  booking_ready: boolean;
  booking_data: {
    room_name: string | null;
    room_id?: number;
    date: string | null;
    start_time: string | null;
    end_time: string | null;
    title: string | null;
    booked_by: string | null;
  } | null;
  error?: string;
}

/**
 * Send a message to the conversational booking agent.
 * @param message The user's message
 * @param history Previous conversation messages
 */
export const converseWithAgent = async (
  message: string,
  history: ConversationMessage[]
): Promise<ConversationResponse> => {
  const response = await api.post('/bookings/converse', {
    message,
    history,
  });
  return response.data;
};

