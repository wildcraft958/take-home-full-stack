import { Routes, Route, Link } from 'react-router-dom'
import './index.css'

/**
 * Room Booking System - Main Application
 *
 * TODO: Implement the following:
 * 1. RoomList - Display all available rooms
 * 2. BookingForm - Traditional form to create bookings
 * 3. NaturalLanguageInput - AI-powered booking via natural language
 * 4. BookingList - Display and filter bookings
 * 5. BookingConfirmation - Preview parsed AI results before booking
 */

function App() {
  return (
    <div className="container">
      <header>
        <h1>🏢 Room Booking System</h1>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Book rooms using natural language or the traditional form
        </p>
        <nav>
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

// =============================================================================
// PLACEHOLDER PAGES - Replace with your implementations
// =============================================================================

function RoomsPage() {
  return (
    <div>
      <h2>Available Rooms</h2>
      <p style={{ color: '#666', margin: '1rem 0' }}>
        TODO: Fetch and display rooms from <code>GET /api/rooms</code>
      </p>

      {/* Example room card structure */}
      <div className="room-grid">
        <div className="room-card">
          <div className="room-name">Conference Room A</div>
          <div className="room-capacity">👥 Capacity: 10 people</div>
          <div className="amenities">
            <span className="amenity-tag">projector</span>
            <span className="amenity-tag">whiteboard</span>
            <span className="amenity-tag">video_conferencing</span>
          </div>
        </div>
        {/* TODO: Map over actual rooms from API */}
      </div>
    </div>
  )
}

function BookingsPage() {
  return (
    <div>
      <h2>All Bookings</h2>

      {/* TODO: Add filter controls */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label>Filter by Date</label>
            <input type="date" />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
            <label>Filter by Room</label>
            <select>
              <option value="">All Rooms</option>
              {/* TODO: Populate with rooms */}
            </select>
          </div>
        </div>
      </div>

      {/* Example booking list structure */}
      <div className="booking-list">
        <div className="booking-item">
          <div className="booking-info">
            <span className="booking-room">Conference Room A</span>
            <span className="booking-time">Jan 30, 2025 • 2:00 PM - 3:00 PM</span>
            <span className="booking-by">Booked by: alice@example.com</span>
          </div>
          <button className="btn-danger">Cancel</button>
        </div>
        {/* TODO: Map over actual bookings from API */}
      </div>
    </div>
  )
}

function NewBookingPage() {
  return (
    <div>
      <h2>Create New Booking</h2>

      {/* ========== AI NATURAL LANGUAGE INPUT ========== */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span className="ai-badge">✨ AI Powered</span>
          <span style={{ color: '#666' }}>Book with natural language</span>
        </div>

        <div className="nl-input-container">
          <input
            type="text"
            className="nl-input"
            placeholder='Try: "Book Conference Room A tomorrow at 2pm for 1 hour"'
          />
          <button
            className="btn-primary"
            style={{ marginTop: '0.5rem' }}
          >
            Parse with AI
          </button>
        </div>

        {/* TODO: Show parsed result preview */}
        {/* Example parsed preview structure: */}
        {/*
        <div className="parsed-preview">
          <h4>Parsed Booking Details</h4>
          <div className="parsed-field">
            <span className="label">Room</span>
            <span className="value">Conference Room A</span>
          </div>
          <div className="parsed-field">
            <span className="label">Date</span>
            <span className="value">January 31, 2025</span>
          </div>
          <div className="parsed-field">
            <span className="label">Time</span>
            <span className="value">2:00 PM - 3:00 PM</span>
          </div>
          <div className="parsed-field">
            <span className="label">Confidence</span>
            <span className="confidence-badge confidence-high">High</span>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary">Confirm Booking</button>
            <button className="btn-secondary">Edit Details</button>
          </div>
        </div>
        */}

        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: '#666' }}>
            Example phrases the AI understands
          </summary>
          <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem', color: '#666' }}>
            <li>"Book Conference Room A tomorrow from 2pm to 3pm"</li>
            <li>"I need a room for 6 people next Monday morning"</li>
            <li>"Reserve the Board Room for a 2-hour meeting on Friday at 10am"</li>
            <li>"Meeting room for quick standup tomorrow 9:30am, 30 minutes"</li>
          </ul>
        </details>
      </div>

      {/* ========== TRADITIONAL FORM ========== */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Or use the form</h3>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Room *</label>
            <select required>
              <option value="">Select a room</option>
              {/* TODO: Populate with rooms from API */}
              <option value="1">Conference Room A (10 people)</option>
              <option value="2">Conference Room B (8 people)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
              <label>Date *</label>
              <input type="date" required />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label>Start Time *</label>
              <input type="time" required />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: '150px' }}>
              <label>End Time *</label>
              <input type="time" required />
            </div>
          </div>

          <div className="form-group">
            <label>Your Name/Email *</label>
            <input type="text" placeholder="john@example.com" required />
          </div>

          <div className="form-group">
            <label>Meeting Title (optional)</label>
            <input type="text" placeholder="Team Standup" />
          </div>

          <button type="submit" className="btn-primary">
            Create Booking
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
