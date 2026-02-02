from datetime import date, time, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator

class BookingBase(BaseModel):
    room_id: int
    title: Optional[str] = None
    booked_by: str
    booking_date: date
    start_time: time
    end_time: time

class BookingCreate(BookingBase):
    @field_validator("end_time")
    def validate_time_range(cls, v, values):
        if "start_time" in values.data and v <= values.data["start_time"]:
            raise ValueError("End time must be after start time")
        return v
    
    @field_validator("booking_date")
    def validate_future_date(cls, v):
        """Ensure booking date is not in the past."""
        if v < date.today():
             raise ValueError("Booking date cannot be in the past")
        return v

class BookingRead(BookingBase):
    id: int
    created_at: datetime
    room_name: Optional[str] = None # Enriched field

    model_config = ConfigDict(from_attributes=True)

class BookingUpdate(BaseModel):
    title: Optional[str] = None
    # We generally don't want to change times without conflict checks, so simplify to just title for now per check
    pass
