from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Room(Base):
    """
    Represents a meeting room available for booking.
    
    Attributes:
        id: Unique identifier for the room.
        name: Display name of the room.
        capacity: Maximum number of people the room can hold.
        amenities: List of available amenities (e.g., projector, whiteboard).
        created_at: Timestamp when the room was added to the system.
    """
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False)
    amenities = Column(JSON, default=[])  # JSON for cross-database compatibility
    created_at = Column(DateTime, server_default=func.now())

    # Relationship to bookings
    bookings = relationship("Booking", back_populates="room")

