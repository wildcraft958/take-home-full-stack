"""
Room Booking API - Main Application

This is the entry point for the FastAPI application.
Implement your routers and include them here.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# TODO: Import your routers
# from app.routers import rooms, bookings

app = FastAPI(
    title="Room Booking API",
    description="API for managing meeting room bookings with AI-powered natural language support",
    version="1.0.0",
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Room Booking API is running"}


@app.get("/health")
def health_check():
    """Health check for Docker"""
    return {"status": "healthy"}


# TODO: Include your routers
# app.include_router(rooms.router, prefix="/api/rooms", tags=["rooms"])
# app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])


# =============================================================================
# PLACEHOLDER ENDPOINTS - Replace with your implementations
# =============================================================================

@app.get("/api/rooms")
def get_rooms_placeholder():
    """
    TODO: Implement this endpoint in routers/rooms.py

    Should return a list of all rooms with their details.
    """
    return {
        "message": "TODO: Implement GET /api/rooms",
        "hint": "Create routers/rooms.py and implement the endpoint"
    }


@app.post("/api/bookings")
def create_booking_placeholder():
    """
    TODO: Implement this endpoint in routers/bookings.py

    Should create a new booking after checking for conflicts.
    """
    return {
        "message": "TODO: Implement POST /api/bookings",
        "hint": "Create routers/bookings.py and implement the endpoint"
    }


@app.post("/api/bookings/parse")
def parse_booking_placeholder():
    """
    TODO: Implement this endpoint for natural language parsing

    Should accept a natural language string and return structured booking data.

    Example request:
        {"text": "Book Conference Room A tomorrow at 2pm for 1 hour"}

    Example response:
        {
            "room_name": "Conference Room A",
            "date": "2025-01-31",
            "start_time": "14:00",
            "end_time": "15:00",
            "booked_by": null,
            "confidence": "high",
            "clarification_needed": "Who is booking this room?"
        }
    """
    return {
        "message": "TODO: Implement POST /api/bookings/parse",
        "hint": "Create services/ai_parser.py and implement natural language parsing"
    }
