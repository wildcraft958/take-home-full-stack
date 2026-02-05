from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_database_session
from app.models.room import Room
from app.schemas.room import RoomRead

router = APIRouter()

@router.get("", response_model=List[RoomRead])
def list_available_rooms(db: Session = Depends(get_database_session)):
    """
    Retrieve a list of all available meeting rooms.
    
    Returns:
        List[RoomRead]: A list of room objects with their details.
    """
    rooms = db.query(Room).all()
    return rooms

@router.get("/{room_id}", response_model=RoomRead)
def retrieve_room_details(room_id: int, db: Session = Depends(get_database_session)):
    """
    Retrieve detailed information for a specific room.
    
    Args:
        room_id (int): The unique identifier of the room.
        
    Raises:
        HTTPException: If the room is not found.
    """
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room
