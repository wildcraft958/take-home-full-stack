from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.database import get_database_session
from app.models.booking import Booking
from app.models.room import Room
from app.schemas.booking import BookingCreate, BookingRead
from app.services.ai_parser import AIBookingParser

router = APIRouter()
ai_parser = AIBookingParser()

@router.get("/", response_model=List[BookingRead])
def get_bookings(
    room_id: Optional[int] = None,
    booking_date: Optional[date] = None,
    db: Session = Depends(get_database_session)
):
    """
    List bookings with optional filters.
    """
    query = db.query(Booking)
    
    if room_id:
        query = query.filter(Booking.room_id == room_id)
    if booking_date:
        query = query.filter(Booking.booking_date == booking_date)
        
    bookings = query.order_by(Booking.booking_date, Booking.start_time).all()
    
    # Enrich with room name for UI convenience
    result = []
    for b in bookings:
        b_read = BookingRead.model_validate(b)
        b_read.room_name = b.room.name
        result.append(b_read)
        
    return result

@router.post("/", response_model=BookingRead)
def create_booking(booking: BookingCreate, db: Session = Depends(get_database_session)):
    """
    Create a new booking with conflict detection.
    """
    # 1. Check if room exists
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    # 2. Check for conflicts
    # Conflict logic: 
    # (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
    conflict = db.query(Booking).filter(
        Booking.room_id == booking.room_id,
        Booking.booking_date == booking.booking_date,
        Booking.start_time < booking.end_time,
        Booking.end_time > booking.start_time
    ).first()
    
    if conflict:
        raise HTTPException(
            status_code=409, 
            detail=f"Room is already booked from {conflict.start_time} to {conflict.end_time}"
        )
        
    new_booking = Booking(**booking.model_dump())
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    # Enrich response
    response = BookingRead.model_validate(new_booking)
    response.room_name = room.name
    return response

@router.delete("/{booking_id}")
def cancel_booking(booking_id: int, db: Session = Depends(get_database_session)):
    """
    Cancel an existing booking.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    db.delete(booking)
    db.commit()
    return {"message": "Booking cancelled successfully"}

@router.post("/parse")
async def analyze_booking_request(text: str, db: Session = Depends(get_database_session)):
    """
    Analyze a natural language booking request using AI.
    
    Returns structured data that can be used to create a booking.
    """
    rooms = db.query(Room).all()
    # Serialize room data for the AI context
    room_context = [{"name": r.name, "capacity": r.capacity} for r in rooms]
    
    # Delegate to AI service
    extraction_result = await ai_parser.parse(text, room_context)
    return extraction_result
