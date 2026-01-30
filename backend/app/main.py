"""
Room Booking API - Main Application

This is the entry point for the FastAPI application.
You will need to:
1. Create models in the models/ directory
2. Create Pydantic schemas in the schemas/ directory
3. Create API routes in the routers/ directory
4. Import and include your routers here
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base

# TODO: Import your routers here
# from app.routers import rooms, bookings

# Create database tables
# Note: In production, you'd use Alembic migrations instead
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Room Booking API",
    description="API for managing meeting room bookings",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint to verify the API is running."""
    return {"status": "healthy", "service": "room-booking-api"}


# TODO: Include your routers here
# app.include_router(rooms.router, prefix="/api/rooms", tags=["rooms"])
# app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])


# Example of what your rooms endpoint might look like:
# (Remove this once you implement the actual router)
@app.get("/api/rooms")
def get_rooms_placeholder():
    """
    Placeholder endpoint - replace with actual implementation.

    This should return a list of all rooms from the database.
    """
    return {
        "message": "TODO: Implement this endpoint",
        "hint": "Create a router in routers/rooms.py and import it in main.py"
    }


@app.get("/api/bookings")
def get_bookings_placeholder():
    """
    Placeholder endpoint - replace with actual implementation.

    This should return a list of all bookings, with optional filtering.
    """
    return {
        "message": "TODO: Implement this endpoint",
        "hint": "Create a router in routers/bookings.py and import it in main.py"
    }
