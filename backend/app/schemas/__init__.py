"""
Pydantic Schemas

Define your request/response schemas here. Example:

from datetime import date, time, datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


# ============ Room Schemas ============

class RoomBase(BaseModel):
    name: str
    capacity: int
    amenities: Optional[List[str]] = []


class RoomResponse(RoomBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Booking Schemas ============

class BookingBase(BaseModel):
    room_id: int
    title: Optional[str] = None
    booked_by: str = Field(..., min_length=1, max_length=100)
    booking_date: date
    start_time: time
    end_time: time

    @field_validator('end_time')
    @classmethod
    def end_time_after_start_time(cls, v, info):
        if 'start_time' in info.data and v <= info.data['start_time']:
            raise ValueError('end_time must be after start_time')
        return v


class BookingCreate(BookingBase):
    pass


class BookingResponse(BookingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BookingWithRoom(BookingResponse):
    room: RoomResponse
"""

# TODO: Implement your schemas here
# Hint: Uncomment and modify the example above
