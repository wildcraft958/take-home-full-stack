"""
Room Booking API - Main Application

This is the entry point for the FastAPI application.
Implement your routers and include them here.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import rooms, bookings
from app.database import engine, Base
from app.models import Room, Booking

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Room Booking API",
    description="API for managing meeting room bookings with AI-powered natural language support",
    version="1.0.0",
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
