-- Room Booking System - Database Initialization
-- This script runs automatically when the PostgreSQL container starts

-- ============================================
-- ROOMS TABLE (provided - do not modify)
-- ============================================

CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL,
    amenities TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SEED DATA - Meeting Rooms
-- ============================================

INSERT INTO rooms (name, capacity, amenities) VALUES
    ('Conference Room A', 10, ARRAY['projector', 'whiteboard', 'video_conferencing']),
    ('Conference Room B', 8, ARRAY['projector', 'whiteboard']),
    ('Meeting Room 1', 4, ARRAY['tv_screen', 'whiteboard']),
    ('Meeting Room 2', 4, ARRAY['tv_screen']),
    ('Board Room', 20, ARRAY['projector', 'video_conferencing', 'whiteboard', 'phone_conferencing']),
    ('Phone Booth 1', 1, ARRAY['phone']),
    ('Phone Booth 2', 1, ARRAY['phone']),
    ('Training Room', 30, ARRAY['projector', 'whiteboard', 'microphone', 'video_conferencing']);

-- ============================================
-- BOOKINGS TABLE (candidate implements)
-- ============================================
-- Uncomment and modify as needed, or create via SQLAlchemy models

/*
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    title VARCHAR(200),
    booked_by VARCHAR(100) NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: end_time must be after start_time
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Index for efficient conflict checking
CREATE INDEX idx_bookings_room_date ON bookings(room_id, booking_date);
*/

-- ============================================
-- SAMPLE BOOKINGS (optional - for testing)
-- ============================================
-- Uncomment to add sample bookings for testing

/*
INSERT INTO bookings (room_id, title, booked_by, booking_date, start_time, end_time) VALUES
    (1, 'Team Standup', 'alice@example.com', CURRENT_DATE, '09:00', '09:30'),
    (1, 'Project Review', 'bob@example.com', CURRENT_DATE, '14:00', '15:00'),
    (2, 'Client Call', 'carol@example.com', CURRENT_DATE, '10:00', '11:00'),
    (5, 'Board Meeting', 'david@example.com', CURRENT_DATE + 1, '09:00', '12:00');
*/
