"""
Pydantic Schemas

Define your request/response schemas here.

Example schemas:

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, time, datetime


# ============ Room Schemas ============

class RoomBase(BaseModel):
    name: str
    capacity: int
    amenities: List[str] = []


class RoomResponse(RoomBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Booking Schemas ============

class BookingBase(BaseModel):
    room_id: int
    title: Optional[str] = None
    booked_by: str
    booking_date: date
    start_time: time
    end_time: time


class BookingCreate(BookingBase):
    pass


class BookingResponse(BookingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BookingWithRoom(BookingResponse):
    room: RoomResponse


# ============ AI Parsing Schemas ============

class ParseBookingRequest(BaseModel):
    '''Request to parse natural language booking'''
    text: str = Field(..., description="Natural language booking request")


class ParsedBookingResponse(BaseModel):
    '''Structured data extracted from natural language'''
    room_name: Optional[str] = Field(None, description="Matched room name")
    room_requirements: Optional[dict] = Field(None, description="Requirements like min_capacity")
    date: Optional[str] = Field(None, description="Booking date (YYYY-MM-DD)")
    start_time: Optional[str] = Field(None, description="Start time (HH:MM)")
    end_time: Optional[str] = Field(None, description="End time (HH:MM)")
    duration_minutes: Optional[int] = Field(None, description="Duration if end_time not specified")
    booked_by: Optional[str] = Field(None, description="Person making the booking")
    title: Optional[str] = Field(None, description="Meeting title/purpose")
    confidence: str = Field("medium", description="Parsing confidence: high, medium, low")
    clarification_needed: Optional[str] = Field(None, description="What info is missing")
    raw_text: str = Field(..., description="Original input text")


class ParseErrorResponse(BaseModel):
    '''Error response when parsing fails'''
    error: str
    suggestion: str
    raw_text: str
"""

# TODO: Implement your schemas here
