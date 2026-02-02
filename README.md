# Full Stack Developer Assessment: Room Booking System

## Overview

Build a **meeting room booking system** with **AI-powered natural language booking**. Users can either fill out a traditional form OR type requests like *"Book Conference Room A for tomorrow at 2pm for 1 hour"* and have the system parse it automatically.

The application consists of a React frontend, FastAPI backend, and PostgreSQL database—all running in Docker.

**Estimated Time:** 4-6 hours

---

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Git (for version control)
- API key for an LLM provider (OpenAI, Anthropic, or other)

### Setup

```bash
# Clone or extract the project
cd take-home-full-stack

# Copy environment file and add your API key
cp .env.example .env
# Edit .env and add your AI provider API key

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

#### 1. View Available Rooms
- Display a list of all meeting rooms
- Show room name, capacity, and amenities for each room
- Rooms are pre-seeded in the database

#### 2. Create a Booking (Traditional Form)
- Users can book a room for a specific date and time
- Required fields: room, date, start time, end time, booked by (name/email)
- Optional: booking title/purpose
- Validate that end time is after start time
- **Prevent double-booking:** Cannot book a room that's already reserved for overlapping times

#### 3. Natural Language Booking (AI Feature)
- Users can type booking requests in natural language
- Examples of inputs to support:
  - *"Book Conference Room A tomorrow from 2pm to 3pm for John"*
  - *"I need a room for 6 people next Monday morning"*
  - *"Reserve the Board Room for a 2-hour meeting on Friday at 10am"*
- The system should:
  - Parse the request using an LLM of your choice
  - Extract: room (or room requirements), date, time, duration, booker name
  - Show the parsed result for user confirmation before booking
  - Handle ambiguous requests gracefully (ask for clarification or show options)
  - Fallback to manual form if parsing fails

#### 4. View Bookings
- Display all bookings with relevant details
- Show: room name, date, time slot, who booked it
- Filter bookings by date OR by room (implement at least one filter)

#### 5. Cancel a Booking
- Users can cancel/delete an existing booking
- Show confirmation before deletion

#### 6. Conflict Detection
- When creating a booking, check for time conflicts
- Display a clear error message if the room is already booked
- A conflict occurs when: `existing_start < new_end AND existing_end > new_start` (same room and date)

### Bonus Features (Optional)

- [ ] Smart room suggestions (AI recommends best room based on requirements)
- [ ] Edit existing bookings (with conflict re-validation)
- [ ] Handle relative dates intelligently ("next Tuesday", "in 3 days")
- [ ] Support for recurring bookings via natural language
- [ ] Unit tests for AI parsing logic
- [ ] Graceful degradation when AI service is unavailable

---

## AI Implementation Guidelines

### Provider Flexibility
You may use **any LLM provider** of your choice:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Local models (Ollama, llama.cpp)
- Other providers

### What We're Evaluating

| Aspect | What We Look For |
|--------|------------------|
| **Prompt Engineering** | Clear, effective prompts that reliably extract structured data |
| **Output Parsing** | Robust handling of LLM responses, including edge cases |
| **Error Handling** | Graceful fallbacks when AI fails or returns unexpected results |
| **User Experience** | Clear feedback during AI processing; confirmation before booking |
| **Code Organization** | AI logic separated into services; easy to swap providers |

### Suggested Approach

```
User Input: "Book room A tomorrow 2-3pm for Alice"
     ↓
[AI Service] Parse natural language
     ↓
Extracted Data: {
  room: "Conference Room A",
  date: "2025-01-31",
  start_time: "14:00",
  end_time: "15:00",
  booked_by: "Alice"
}
     ↓
[Show Confirmation UI] "Book Conference Room A on Jan 31, 2-3 PM?"
     ↓
[User Confirms] → Create booking via standard API
```

### Example Prompt Structure (for reference)

```
You are a booking assistant. Parse the following room booking request and extract structured information.

Available rooms: Conference Room A (10 people), Conference Room B (8 people), Meeting Room 1 (4 people), ...

Today's date: {current_date}

User request: "{user_input}"

Extract and return JSON:
{
  "room_name": string or null,
  "room_requirements": { "min_capacity": number } or null,
  "date": "YYYY-MM-DD",
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "booked_by": string,
  "title": string or null,
  "confidence": "high" | "medium" | "low",
  "clarification_needed": string or null
}
```

---

## Technical Specifications

### Database Schema

**Provided (rooms table):**
```sql
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL,
    amenities TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**You implement (bookings table):**
```sql
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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms` | List all rooms |
| GET | `/api/rooms/{id}` | Get room details |
| GET | `/api/bookings` | List bookings (with optional filters) |
| POST | `/api/bookings` | Create a booking |
| DELETE | `/api/bookings/{id}` | Cancel a booking |
| **POST** | **`/api/bookings/parse`** | **Parse natural language → structured booking data** |

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18+ with TypeScript |
| Styling | Your choice (CSS, Tailwind, MUI, etc.) |
| Backend | Python 3.11+ with FastAPI |
| ORM | SQLAlchemy (recommended) or raw SQL |
| Database | PostgreSQL 15 |
| AI | Any LLM provider (OpenAI, Anthropic, etc.) |
| Containerization | Docker & Docker Compose |

---

## Project Structure

```
room-booking-assessment/
├── docker-compose.yml
├── .env.example              # API key configuration
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py           # FastAPI application
│       ├── database.py       # Database connection
│       ├── models/           # SQLAlchemy models
│       ├── schemas/          # Pydantic schemas
│       ├── routers/          # API route handlers
│       └── services/         # AI service + business logic
│           └── ai_parser.py  # Natural language parsing (you implement)
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── App.tsx
│       ├── api/client.ts     # Pre-configured API client
│       ├── components/       # Your React components
│       └── types/index.ts    # TypeScript definitions
│
└── database/
    └── init.sql              # Schema + seed data
```

---

## Evaluation Criteria

| Category | Weight | What We're Looking For |
|----------|--------|------------------------|
| **Functionality** | 25% | All core features work correctly; edge cases handled |
| **AI Integration** | 25% | Effective prompts; robust parsing; good UX for AI features |
| **Code Quality** | 20% | Clean, readable, well-organized code; appropriate abstractions |
| **API Design** | 15% | RESTful conventions; proper HTTP status codes; input validation |
| **Frontend UX** | 10% | Intuitive interface; loading states; error handling |
| **Docker/DevOps** | 5% | Application runs with single `docker-compose up` |

---

## Submission Guidelines

### Deliverables

1. **Source Code** (GitHub repo or zip file)

2. **Updated README** - Add a "Candidate Notes" section with:
   - Which AI provider you used and why
   - Your prompt engineering approach
   - Any assumptions made
   - What you would improve with more time
   - Approximate time spent

### Before Submitting

- [ ] Run `docker-compose down -v && docker-compose up --build` to verify clean startup
- [ ] Test all core features including natural language booking
- [ ] Test AI parsing with various input formats
- [ ] Verify graceful handling when AI service is unavailable
- [ ] Remove debug statements and hardcoded API keys

---

## Hints & Tips

### Time Management
| Time | Focus |
|------|-------|
| Hour 1 | Database model + basic CRUD API |
| Hour 2 | Complete API with conflict detection |
| Hour 2-3 | AI parsing service + `/parse` endpoint |
| Hour 3-5 | Frontend: forms, lists, NL input |
| Hour 5-6 | Polish, error handling, documentation |

### AI Parsing Tips
1. **Start simple:** Get basic "Book Room X on Date at Time" working first
2. **Use structured output:** Ask the LLM to return JSON for easier parsing
3. **Include context:** Pass available room names to the LLM so it can match correctly
4. **Handle uncertainty:** Use a "confidence" field; ask for confirmation on low confidence
5. **Test edge cases:** "tomorrow", "next week", partial information, typos

### Conflict Detection Query
```sql
SELECT * FROM bookings
WHERE room_id = :room_id
  AND booking_date = :date
  AND start_time < :end_time
  AND end_time > :start_time;
```

---

## Questions?

If you have questions about the requirements, please reach out to [HIRING_MANAGER_EMAIL]. Asking good questions is encouraged!

Good luck!

---

## Candidate Notes

### AI Provider Choice
I chose **Ollama** (with `gemma3:1b` locally) and **LangChain** for this implementation.
- **Why LangChain**: Abstracts away provider differences, making it easy to switch between OpenAI/OpenRouter and Ollama via environment variables.
- **Why Ollama**: Free, local inference with no API costs. The code also supports OpenAI/OpenRouter by changing `AI_PROVIDER` env var.

### Prompt Engineering Approach
I implemented a **multi-turn conversational agent** rather than single-shot parsing:

1. **Context Injection**: The system prompt includes available rooms (name + capacity) and current date.
2. **Conversation Flow Rules**: The AI follows a strict flow - ask about room, then date, then time - one question at a time.
3. **Confirmation Gate**: The AI only sets `booking_ready=true` when ALL required fields (room, date, time) are collected AND the response doesn't contain a question.
4. **Frontend Safeguard**: Even if the AI misbehaves, the frontend validates that required fields exist and no question mark is in the message before showing the confirmation card.

### Key Features Implemented

#### Core Requirements
-  **View Available Rooms** - Grid display with capacity and amenities
-  **Create Booking (Form)** - Full form with client-side validation (end time > start time)
-  **Natural Language Booking** - Multi-turn conversational AI agent
-  **View Bookings** - History view with filtering by status AND room
-  **Cancel Booking** - Delete with confirmation dialog
-  **Conflict Detection** - Prevents double-booking with clear error messages

#### Additional Features
-  **Full-screen chat UI** - Modern GPT-like interface
-  **Landing page** - Professional entry with AI/Manual booking options
-  **Book from Room List** - Click room → pre-filled booking form
-  **Room seeding** - Auto-populates 5 sample rooms on startup
-  **Graceful fallback** - Returns user-friendly error on AI failure
-  **Animated transitions** - Framer Motion for smooth UX

### Assumptions
- **Timezone**: Assumes local server time for relative dates ("tomorrow", "next Monday").
- **Room Matching**: The LLM matches user input to available room names (fuzzy matching delegated to AI).
- **Default Duration**: 1 hour if not specified.

### Improvements (With More Time)
1. **Auth**: JWT-based user authentication so `booked_by` is auto-populated.
2. **Recurring Bookings**: Handle "every Tuesday at 2pm" requests.
3. **Edit Bookings**: Allow modifying existing bookings with re-validation.
4. **Unit Tests**: More comprehensive test coverage for AI parser edge cases.
5. **Smart Room Suggestions**: AI recommends best room based on capacity requirements.

### Time Spent
Approximately 3-4 hours.


