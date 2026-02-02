"""
Integration test for AI Booking Parser using Ollama.

This test requires Ollama to be running locally with a model available.
Run with: pytest backend/tests/test_ai_parser.py -v
"""

import pytest
import asyncio
import os

# Set environment for Ollama before importing the parser
os.environ["AI_PROVIDER"] = "ollama"
os.environ["OLLAMA_MODEL"] = "gemma3:1b"
os.environ["OLLAMA_BASE_URL"] = "http://localhost:11434"

from app.services.ai_parser import AIBookingParser


@pytest.fixture
def ai_parser():
    """Create an AI parser instance configured for Ollama."""
    return AIBookingParser()


@pytest.fixture
def sample_rooms():
    """Sample room data for testing."""
    return [
        {"name": "Conference Room A", "capacity": 10},
        {"name": "Board Room", "capacity": 20},
        {"name": "Meeting Room 1", "capacity": 4},
    ]


@pytest.mark.asyncio
async def test_parse_simple_booking(ai_parser, sample_rooms):
    """Test parsing a simple booking request."""
    text = "Book Conference Room A tomorrow at 2pm for 1 hour"
    
    result = await ai_parser.parse(text, sample_rooms)
    
    assert result is not None
    assert "confidence" in result
    print(f"Parsed result: {result}")


@pytest.mark.asyncio
async def test_parse_with_capacity(ai_parser, sample_rooms):
    """Test parsing a request with capacity requirement."""
    text = "I need a room for 6 people next Monday at 10am"
    
    result = await ai_parser.parse(text, sample_rooms)
    
    assert result is not None
    print(f"Parsed result: {result}")


@pytest.mark.asyncio
async def test_parse_ambiguous_request(ai_parser, sample_rooms):
    """Test handling of ambiguous requests."""
    text = "Book a room sometime"
    
    result = await ai_parser.parse(text, sample_rooms)
    
    assert result is not None
    # Should indicate low confidence or need clarification
    print(f"Ambiguous result: {result}")


if __name__ == "__main__":
    # Quick manual test
    async def main():
        parser = AIBookingParser()
        rooms = [
            {"name": "Conference Room A", "capacity": 10},
            {"name": "Board Room", "capacity": 20},
        ]
        
        result = await parser.parse(
            "Book the Board Room for tomorrow at 3pm for a team meeting",
            rooms
        )
        print(f"Result: {result}")
    
    asyncio.run(main())
