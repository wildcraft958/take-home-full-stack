"""
Room Booking API - Main Application

This is the entry point for the FastAPI application.
Implement your routers and include them here.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import rooms, bookings
from app.database import engine, Base, SessionLocal
from app.models import Room, Booking

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and seed data on startup."""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Seed sample rooms if empty
    db = SessionLocal()
    try:
        if db.query(Room).count() == 0:
            sample_rooms = [
                Room(name="Conference Room A", capacity=10, amenities=["projector", "whiteboard", "video_conferencing"]),
                Room(name="Board Room", capacity=20, amenities=["projector", "video_conferencing", "catering"]),
                Room(name="Meeting Room 1", capacity=4, amenities=["whiteboard"]),
                Room(name="Meeting Room 2", capacity=6, amenities=["projector", "whiteboard"]),
                Room(name="Training Room", capacity=30, amenities=["projector", "microphone", "recording"]),
            ]
            db.add_all(sample_rooms)
            db.commit()
            logger.info("Seeded sample rooms")
    finally:
        db.close()
    
    yield  # App runs here
    # Cleanup on shutdown (if needed)


app = FastAPI(
    title="Room Booking API",
    description="API for managing meeting room bookings with AI-powered natural language support",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://0.0.0.0:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def check_api_status():
    """
    Root endpoint to verify API availability.
    
    Returns:
        dict: Status message confirming the API is running.
    """
    return {"status": "ok", "message": "Room Booking API is running"}


@app.get("/health")
def perform_health_check():
    """
    Health check endpoint for container orchestration.
    
    Returns:
        dict: Health status.
    """
    return {"status": "healthy"}

# Include Routers
app.include_router(rooms.router, prefix="/api/rooms", tags=["rooms"])
app.include_router(bookings.router, prefix="/api/bookings", tags=["bookings"])

