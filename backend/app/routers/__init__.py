"""
API Routers

Create your route handlers in separate files:
- rooms.py - Room-related endpoints
- bookings.py - Booking-related endpoints

Example rooms.py:

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Room
from app.schemas import RoomResponse

router = APIRouter()


@router.get("/", response_model=List[RoomResponse])
def get_rooms(db: Session = Depends(get_db)):
    rooms = db.query(Room).all()
    return rooms


@router.get("/{room_id}", response_model=RoomResponse)
def get_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


Example bookings.py:

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import date

from app.database import get_db
from app.models import Booking, Room
from app.schemas import BookingCreate, BookingResponse, BookingWithRoom

router = APIRouter()


def check_booking_conflict(db: Session, room_id: int, booking_date: date,
                           start_time, end_time, exclude_booking_id: int = None):
    '''Check if there's a conflicting booking for the same room and time.'''
    query = db.query(Booking).filter(
        and_(
            Booking.room_id == room_id,
            Booking.booking_date == booking_date,
            Booking.start_time < end_time,
            Booking.end_time > start_time
        )
    )
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)
    return query.first()


@router.post("/", response_model=BookingResponse, status_code=201)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    # Check if room exists
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Check for conflicts
    conflict = check_booking_conflict(
        db, booking.room_id, booking.booking_date,
        booking.start_time, booking.end_time
    )
    if conflict:
        raise HTTPException(
            status_code=409,
            detail="Room is already booked for this time slot"
        )

    # Create booking
    db_booking = Booking(**booking.model_dump())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


@router.get("/", response_model=List[BookingWithRoom])
def get_bookings(
    room_id: Optional[int] = Query(None),
    booking_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Booking)
    if room_id:
        query = query.filter(Booking.room_id == room_id)
    if booking_date:
        query = query.filter(Booking.booking_date == booking_date)
    return query.all()


@router.delete("/{booking_id}", status_code=204)
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    db.delete(booking)
    db.commit()
    return None
"""

# TODO: Create rooms.py and bookings.py files with your route handlers
