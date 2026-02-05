"""
Room Booking API - Main Application

This is the entry point for the FastAPI application.
Implement your routers and include them here.
"""

import logging
from datetime import date, time, timedelta
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
        
        # Seed sample bookings if empty (for demo purposes)
        if db.query(Booking).count() == 0:
            today = date.today()
            tomorrow = today + timedelta(days=1)
            next_week = today + timedelta(days=7)
            
            # Get room references
            conf_a = db.query(Room).filter(Room.name == "Conference Room A").first()
            board = db.query(Room).filter(Room.name == "Board Room").first()
            meeting1 = db.query(Room).filter(Room.name == "Meeting Room 1").first()
            meeting2 = db.query(Room).filter(Room.name == "Meeting Room 2").first()
            training = db.query(Room).filter(Room.name == "Training Room").first()
            
            if conf_a and board and meeting1:
                sample_bookings = [
                    Booking(room_id=conf_a.id, title="Team Standup", booked_by="alice@example.com",
                            booking_date=tomorrow, start_time=time(9, 0), end_time=time(9, 30)),
                    Booking(room_id=conf_a.id, title="Project Review", booked_by="bob@example.com",
                            booking_date=tomorrow, start_time=time(14, 0), end_time=time(15, 0)),
                    Booking(room_id=board.id, title="Quarterly Planning", booked_by="carol@example.com",
                            booking_date=tomorrow, start_time=time(10, 0), end_time=time(12, 0)),
                    Booking(room_id=meeting1.id, title="1:1 with Manager", booked_by="dave@example.com",
                            booking_date=tomorrow, start_time=time(15, 30), end_time=time(16, 0)),
                    Booking(room_id=board.id, title="Board Meeting", booked_by="eve@example.com",
                            booking_date=next_week, start_time=time(9, 0), end_time=time(12, 0)),
                ]
                db.add_all(sample_bookings)
                db.commit()
                logger.info("Seeded sample bookings")
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
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://0.0.0.0:5173",
        "https://frontend-production-b55b.up.railway.app",
        "https://*.up.railway.app",
    ],
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

