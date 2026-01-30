# Full Stack Developer Assessment: Room Booking System

## Overview

Build a **meeting room booking system** that allows users to view available rooms and create, view, and cancel reservations. The application consists of a React frontend, FastAPI backend, and PostgreSQL database—all running in Docker.

**Estimated Time:** 4-6 hours

---

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Git (for version control)

### Running the Application

```bash
# Clone or extract the project
cd take-home-full-stack

# Start all services
docker-compose up --build

# The application will be available at:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

### Development Workflow

The project is configured with hot-reloading:
- **Backend:** Changes to `backend/app/` will auto-reload
- **Frontend:** Changes to `frontend/src/` will auto-reload

---

## Requirements

### Core Features (Required)

You must implement the following features:

#### 1. View Available Rooms
- Display a list of all meeting rooms
- Show room name, capacity, and amenities for each room
- Rooms are pre-seeded in the database

#### 2. Create a Booking
- Users can book a room for a specific date and time
- Required fields: room, date, start time, end time, booked by (name/email)
- Optional: booking title/purpose
- Validate that end time is after start time
- **Prevent double-booking:** Cannot book a room that's already reserved for overlapping times

#### 3. View Bookings
- Display all bookings with relevant details
- Show: room name, date, time slot, who booked it
- Filter bookings by date OR by room (implement at least one filter)

#### 4. Cancel a Booking
- Users can cancel/delete an existing booking
- Show confirmation before deletion

#### 5. Conflict Detection
- When creating a booking, check for time conflicts
- Display a clear error message if the room is already booked for the requested time
- A conflict occurs when: `existing_start < new_end AND existing_end > new_start` (for the same room and date)

### Bonus Features (Optional)

Implement any of these for extra credit:

- [ ] Edit existing bookings (with conflict re-validation)
- [ ] Filter/search rooms by capacity or amenities
- [ ] View a room's availability calendar for a specific date
- [ ] Recurring bookings (daily/weekly)
- [ ] Responsive mobile-friendly design
- [ ] Unit tests for backend API
- [ ] Frontend component tests

---

## Technical Specifications

### Database Schema

The following table is pre-created with seed data:

```sql
-- Provided: rooms table
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL,
    amenities TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

You need to create:

```sql
-- You implement: bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    title VARCHAR(200),
    booked_by VARCHAR(100) NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

Design RESTful endpoints. Suggested structure:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms` | List all rooms |
| GET | `/api/rooms/{id}` | Get room details |
| GET | `/api/bookings` | List bookings (with optional filters) |
| GET | `/api/bookings/{id}` | Get booking details |
| POST | `/api/bookings` | Create a new booking |
| DELETE | `/api/bookings/{id}` | Cancel a booking |
| PUT | `/api/bookings/{id}` | (Bonus) Update a booking |

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18+ with TypeScript |
| Styling | Your choice (CSS, Tailwind, MUI, etc.) |
| Backend | Python 3.11+ with FastAPI |
| ORM | SQLAlchemy (recommended) or raw SQL |
| Database | PostgreSQL 15 |
| Containerization | Docker & Docker Compose |

---

## Project Structure

```
room-booking-assessment/
├── docker-compose.yml          # Orchestrates all services
├── README.md                   # This file
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI application entry point
│       ├── database.py         # Database connection setup
│       ├── models/             # SQLAlchemy models (you implement)
│       ├── schemas/            # Pydantic schemas (you implement)
│       └── routers/            # API route handlers (you implement)
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx            # React entry point
│       ├── App.tsx             # Main app component (basic shell)
│       ├── api/
│       │   └── client.ts       # Axios instance (pre-configured)
│       ├── components/         # Your React components
│       └── types/
│           └── index.ts        # TypeScript type definitions
│
└── database/
    └── init.sql                # Initial schema + seed data
```

---

## Evaluation Criteria

| Category | Weight | What We're Looking For |
|----------|--------|------------------------|
| **Functionality** | 30% | All core features work correctly; edge cases handled |
| **Code Quality** | 25% | Clean, readable, well-organized code; appropriate abstractions |
| **API Design** | 20% | RESTful conventions; proper HTTP status codes; input validation |
| **Frontend UX** | 15% | Intuitive interface; loading states; error handling; form validation |
| **Docker/DevOps** | 10% | Application runs with single `docker-compose up`; no manual setup |

### What We Value

- **Working software** over perfect code—make it work first
- **Clear code** over clever code—readability matters
- **Practical solutions** over over-engineering
- **Good error handling**—users should know what went wrong
- **Consistent patterns**—pick an approach and stick with it

---

## Submission Guidelines

### Deliverables

1. **Source Code**
   - Push to a GitHub repository (preferred) OR
   - Send as a zip file

2. **Updated README** (add a section called "Candidate Notes")
   - Any assumptions you made
   - What you would improve with more time
   - Approximate time spent
   - Any bonus features implemented

### Before Submitting

- [ ] Run `docker-compose down -v && docker-compose up --build` to verify clean startup
- [ ] Test all core features manually
- [ ] Remove any console.log/print statements used for debugging
- [ ] Ensure no hardcoded secrets or credentials

---

## Hints & Tips

1. **Start with the database model**—define your bookings table first
2. **Build the API next**—test with the Swagger docs at `/docs`
3. **Frontend last**—connect to your working API
4. **Time management:**
   - Hour 1: Database + basic API endpoints
   - Hour 2-3: Complete API with validation + conflict detection
   - Hour 3-5: Frontend implementation
   - Hour 5-6: Polish, testing, documentation

5. **Conflict detection query hint:**
   ```sql
   SELECT * FROM bookings
   WHERE room_id = :room_id
     AND booking_date = :date
     AND start_time < :end_time
     AND end_time > :start_time;
   ```

---

## Questions?

If you have questions about the requirements, please reach out to [HIRING_MANAGER_EMAIL]. We're happy to clarify—asking good questions is a positive signal!

Good luck! 🚀
