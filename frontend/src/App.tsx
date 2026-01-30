import { Routes, Route, Link } from 'react-router-dom'
import './index.css'

/**
 * Room Booking System - Main Application
 *
 * TODO: Implement the following components:
 * 1. RoomList - Display all available rooms
 * 2. BookingForm - Create a new booking
 * 3. BookingList - Display and filter bookings
 * 4. Navigation between views
 *
 * Suggested component structure:
 * - components/RoomList.tsx
 * - components/RoomCard.tsx
 * - components/BookingForm.tsx
 * - components/BookingList.tsx
 * - components/BookingCard.tsx
 */

function App() {
  return (
    <div className="container">
      <header style={{ marginBottom: '2rem' }}>
        <h1>🏢 Room Booking System</h1>
        <nav style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/">Rooms</Link>
          <Link to="/bookings">Bookings</Link>
          <Link to="/book">New Booking</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<RoomsPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/book" element={<NewBookingPage />} />
        </Routes>
      </main>
    </div>
  )
}

// Placeholder pages - replace with your implementations

function RoomsPage() {
  return (
    <div className="card">
      <h2>Available Rooms</h2>
      <p style={{ color: '#666', marginTop: '1rem' }}>
        TODO: Fetch and display rooms from the API
      </p>
      <pre style={{ background: '#f5f5f5', padding: '1rem', marginTop: '1rem' }}>
        {`// Hint: Use the api client
import { api } from './api/client'

const fetchRooms = async () => {
  const response = await api.get('/api/rooms')
  return response.data
}`}
      </pre>
    </div>
  )
}

function BookingsPage() {
  return (
    <div className="card">
      <h2>All Bookings</h2>
      <p style={{ color: '#666', marginTop: '1rem' }}>
        TODO: Fetch and display bookings, add filtering by date or room
      </p>
    </div>
  )
}

function NewBookingPage() {
  return (
    <div className="card">
      <h2>Create New Booking</h2>
      <p style={{ color: '#666', marginTop: '1rem' }}>
        TODO: Implement booking form with:
      </p>
      <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
        <li>Room selection (dropdown)</li>
        <li>Date picker</li>
        <li>Start time & end time</li>
        <li>Your name/email</li>
        <li>Optional: booking title</li>
      </ul>
    </div>
  )
}

export default App
