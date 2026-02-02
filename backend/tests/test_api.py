import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import patch
import os

# Mock the database URL to use SQLite
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["OPENAI_API_KEY"] = "test-key"

from app.database import Base, get_database_session
from app.main import app

# Setup in-memory SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the database dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_database_session] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Room Booking API is running"}

def test_create_room_and_list():
    # Insert a dummy room manually since we don't have a POST /rooms
    db = TestingSessionLocal()
    from app.models.room import Room
    room = Room(name="Test Room", capacity=10, amenities=["wifi"])
    db.add(room)
    db.commit()
    db.close()

    response = client.get("/api/rooms/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Room"
    assert data[0]["capacity"] == 10

def test_create_booking_success():
    # Setup room
    db = TestingSessionLocal()
    from app.models.room import Room
    room = Room(name="Test Room", capacity=10)
    db.add(room)
    db.commit()
    room_id = room.id
    db.close()

    # Create Booking
    booking_data = {
        "room_id": room_id,
        "booked_by": "test@example.com",
        "booking_date": "2030-01-01",  # Future date
        "start_time": "10:00",
        "end_time": "11:00",
        "title": "Test Meeting"
    }
    response = client.post("/api/bookings/", json=booking_data)
    assert response.status_code == 200  
    data = response.json()
    assert data["booked_by"] == "test@example.com"
    assert data["start_time"] == "10:00:00"

def test_create_booking_conflict():
    # Setup room
    db = TestingSessionLocal()
    from app.models.room import Room
    room = Room(name="Test Room", capacity=10)
    db.add(room)
    db.commit()
    room_id = room.id
    db.close()

    booking_data = {
        "room_id": room_id,
        "booked_by": "user1",
        "booking_date": "2030-01-01",
        "start_time": "10:00",
        "end_time": "11:00"
    }
    client.post("/api/bookings/", json=booking_data)

    # Try overlapping booking
    conflict_data = {
        "room_id": room_id,
        "booked_by": "user2",
        "booking_date": "2030-01-01",
        "start_time": "10:30", # Overlaps
        "end_time": "11:30"
    }
    response = client.post("/api/bookings/", json=conflict_data)
    assert response.status_code == 409
    assert "booked" in response.json()["detail"].lower()

def test_past_date_booking():
    # Setup room
    db = TestingSessionLocal()
    from app.models.room import Room
    room = Room(name="Test Room", capacity=10)
    db.add(room)
    db.commit()
    room_id = room.id
    db.close()

    booking_data = {
        "room_id": room_id,
        "booked_by": "user1",
        "booking_date": "2020-01-01", # Past date
        "start_time": "10:00",
        "end_time": "11:00"
    }
    response = client.post("/api/bookings/", json=booking_data)
    assert response.status_code == 422 # Validation Error
