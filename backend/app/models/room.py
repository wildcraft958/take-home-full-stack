from sqlalchemy import Column, Integer, String, ARRAY, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False)
    amenities = Column(ARRAY(String), default=[])
    created_at = Column(DateTime, server_default=func.now())

    # Relationship to bookings
    bookings = relationship("Booking", back_populates="room")
