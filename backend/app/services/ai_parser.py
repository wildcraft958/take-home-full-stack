"""
AI Booking Parser Service

This service handles natural language parsing for booking requests.
Implement your LLM integration here.

You can use any LLM provider:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini)
- Local models (Ollama)
- Any other provider

The key responsibilities:
1. Send the user's natural language input to an LLM
2. Parse the structured response
3. Handle errors and edge cases gracefully
"""

import os
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

# TODO: Import your chosen AI provider
# from openai import OpenAI
# from anthropic import Anthropic


class AIBookingParser:
    """
    Natural language parser for room booking requests.

    Example usage:
        parser = AIBookingParser()
        result = await parser.parse(
            "Book Conference Room A tomorrow at 2pm for 1 hour",
            rooms=[{"name": "Conference Room A", "capacity": 10}, ...]
        )
    """

    def __init__(self):
        """Initialize the AI client with API keys from environment."""
        self.provider = os.getenv("AI_PROVIDER", "openai")

        # TODO: Initialize your AI client
        # Example for OpenAI:
        # self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        # Example for Anthropic:
        # self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

        pass

    def _build_system_prompt(self, rooms: List[Dict[str, Any]]) -> str:
        """
        Build the system prompt with available room information.

        Args:
            rooms: List of room dicts with 'name' and 'capacity'

        Returns:
            System prompt string for the LLM
        """
        room_list = "\n".join([
            f"- {r['name']} (capacity: {r['capacity']} people)"
            for r in rooms
        ])

        today = datetime.now().strftime("%Y-%m-%d")
        day_of_week = datetime.now().strftime("%A")

        return f"""You are a meeting room booking assistant. Parse natural language booking requests and extract structured information.

Available rooms:
{room_list}

Today's date: {today} ({day_of_week})

Your task:
1. Extract booking details from the user's request
2. Match room names to available rooms (fuzzy matching OK)
3. Convert relative dates ("tomorrow", "next Monday") to YYYY-MM-DD format
4. Convert times to 24-hour HH:MM format
5. Calculate end_time from duration if not explicitly stated

Respond with valid JSON only, using this exact structure:
{{
    "room_name": "exact room name from list or null",
    "room_requirements": {{"min_capacity": number}} or null,
    "date": "YYYY-MM-DD",
    "start_time": "HH:MM",
    "end_time": "HH:MM",
    "booked_by": "person name or null",
    "title": "meeting title or null",
    "confidence": "high" | "medium" | "low",
    "clarification_needed": "what information is missing, or null"
}}

Rules:
- If the user mentions a room by partial name, match it to the closest available room
- If no room is specified but capacity is mentioned, set room_requirements.min_capacity
- If duration is given (e.g., "1 hour"), calculate end_time from start_time
- Set confidence to "low" if multiple interpretations are possible
- Set clarification_needed if critical info is missing (date, time, or room)
- Default duration is 1 hour if not specified
- "Morning" = 09:00, "Afternoon" = 14:00, "EOD" = 17:00"""

    async def parse(
        self,
        text: str,
        rooms: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Parse a natural language booking request.

        Args:
            text: User's natural language input
            rooms: List of available rooms with name and capacity

        Returns:
            Parsed booking data dict

        Example:
            >>> await parser.parse("Book room A tomorrow 2-3pm", rooms)
            {
                "room_name": "Conference Room A",
                "date": "2025-01-31",
                "start_time": "14:00",
                "end_time": "15:00",
                "confidence": "high",
                ...
            }
        """

        # TODO: Implement your LLM call here
        #
        # Example with OpenAI:
        # response = self.client.chat.completions.create(
        #     model="gpt-4o-mini",
        #     messages=[
        #         {"role": "system", "content": self._build_system_prompt(rooms)},
        #         {"role": "user", "content": text}
        #     ],
        #     response_format={"type": "json_object"}
        # )
        # result = json.loads(response.choices[0].message.content)
        #
        # Example with Anthropic:
        # response = self.client.messages.create(
        #     model="claude-3-haiku-20240307",
        #     max_tokens=1024,
        #     system=self._build_system_prompt(rooms),
        #     messages=[{"role": "user", "content": text}]
        # )
        # result = json.loads(response.content[0].text)

        # Placeholder response - replace with actual implementation
        return {
            "room_name": None,
            "room_requirements": None,
            "date": None,
            "start_time": None,
            "end_time": None,
            "booked_by": None,
            "title": None,
            "confidence": "low",
            "clarification_needed": "AI parser not yet implemented",
            "raw_text": text
        }

    def _parse_llm_response(self, response_text: str) -> Dict[str, Any]:
        """
        Parse and validate the LLM's JSON response.

        Args:
            response_text: Raw text from LLM (should be JSON)

        Returns:
            Parsed dict with booking data

        Raises:
            ValueError: If response is not valid JSON or missing required fields
        """
        try:
            data = json.loads(response_text)
        except json.JSONDecodeError as e:
            raise ValueError(f"LLM returned invalid JSON: {e}")

        # Validate required structure
        required_fields = ["confidence"]
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")

        return data

    def _calculate_end_time(
        self,
        start_time: str,
        duration_minutes: int
    ) -> str:
        """
        Calculate end time from start time and duration.

        Args:
            start_time: Start time in HH:MM format
            duration_minutes: Duration in minutes

        Returns:
            End time in HH:MM format
        """
        start = datetime.strptime(start_time, "%H:%M")
        end = start + timedelta(minutes=duration_minutes)
        return end.strftime("%H:%M")


# =============================================================================
# Alternative: Simple regex-based parser (fallback or for testing)
# =============================================================================

class SimpleBookingParser:
    """
    A simple rule-based parser as a fallback when AI is unavailable.
    This demonstrates graceful degradation.
    """

    def parse(self, text: str, rooms: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Basic regex-based parsing - very limited but works offline."""
        import re
        from dateutil import parser as date_parser
        from dateutil.relativedelta import relativedelta, MO, TU, WE, TH, FR, SA, SU

        result = {
            "room_name": None,
            "room_requirements": None,
            "date": None,
            "start_time": None,
            "end_time": None,
            "booked_by": None,
            "title": None,
            "confidence": "low",
            "clarification_needed": None,
            "raw_text": text
        }

        text_lower = text.lower()

        # Try to match room names
        for room in rooms:
            if room["name"].lower() in text_lower:
                result["room_name"] = room["name"]
                result["confidence"] = "medium"
                break

        # Try to find "tomorrow"
        if "tomorrow" in text_lower:
            result["date"] = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

        # Try to find times like "2pm", "14:00", "2:00 pm"
        time_pattern = r'(\d{1,2})(?::(\d{2}))?\s*(am|pm)?'
        times = re.findall(time_pattern, text_lower)

        if times:
            parsed_times = []
            for match in times:
                hour = int(match[0])
                minute = int(match[1]) if match[1] else 0
                ampm = match[2]

                if ampm == "pm" and hour < 12:
                    hour += 12
                elif ampm == "am" and hour == 12:
                    hour = 0

                parsed_times.append(f"{hour:02d}:{minute:02d}")

            if len(parsed_times) >= 1:
                result["start_time"] = parsed_times[0]
            if len(parsed_times) >= 2:
                result["end_time"] = parsed_times[1]

        # Check what's missing
        missing = []
        if not result["date"]:
            missing.append("date")
        if not result["start_time"]:
            missing.append("start time")
        if not result["room_name"]:
            missing.append("room")

        if missing:
            result["clarification_needed"] = f"Please specify: {', '.join(missing)}"

        return result
