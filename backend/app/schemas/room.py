from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class RoomBase(BaseModel):
    name: str
    capacity: int
    amenities: List[str] = []

class RoomRead(RoomBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
