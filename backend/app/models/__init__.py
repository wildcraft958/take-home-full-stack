"""
SQLAlchemy Models

Define your database models here. Example:

from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, ARRAY, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False)
    amenities = Column(ARRAY(String))
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationship to bookings
    bookings = relationship("Booking", back_populates="room")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200))
    booked_by = Column(String(100), nullable=False)
    booking_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationship to room
    room = relationship("Room", back_populates="bookings")
"""

# TODO: Implement your models here
# Hint: Uncomment and modify the example above
