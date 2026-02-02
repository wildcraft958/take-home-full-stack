"""
AI Booking Parser Service - Conversational Agent

This module provides a multi-turn conversational AI for room booking.
Supports both OpenAI/OpenRouter and Ollama as AI providers.
"""

import os
import json
import re
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

logger = logging.getLogger(__name__)


class AIBookingParser:
    """
    Conversational AI agent for room booking.
    
    Supports multi-turn conversations where the AI:
    - Asks clarifying questions when information is missing
    - Accumulates booking details across conversation turns
    - Indicates when booking is ready for confirmation
    """

    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "openai")
        self.api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
        self.base_url = os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
        self.model_name = os.getenv("AI_MODEL", "openai/gpt-3.5-turbo")
        self.ollama_model = os.getenv("OLLAMA_MODEL", "gemma3:1b")
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

        if self.provider == "ollama":
            from langchain_community.chat_models import ChatOllama
            self.llm = ChatOllama(
                model=self.ollama_model,
                base_url=self.ollama_base_url
            )
        else:
            self.llm = ChatOpenAI(
                model=self.model_name,
                api_key=self.api_key,
                base_url=self.base_url
            )

    def _build_system_prompt(self, rooms: List[Dict[str, Any]]) -> str:
        """Construct the system prompt for the conversational agent."""
        room_list = "\n".join([f"- {r['name']} (capacity: {r['capacity']})" for r in rooms])
        today = datetime.now().strftime("%Y-%m-%d (%A)")

        return f"""You are a friendly booking assistant helping users book meeting rooms through conversation.

Available Rooms:
{room_list}

Today's Date: {today}

CONVERSATION FLOW (follow this strictly):
1. Greet user and understand their request
2. Ask about ROOM preference if not specified (capacity needs, room name, etc.)
3. Ask about DATE if not specified
4. Ask about TIME if not specified
5. Ask about meeting PURPOSE/TITLE (optional but nice to have)
6. ONLY after collecting room, date, AND time, summarize and set booking_ready=true

CRITICAL RULES:
- Ask ONE question at a time
- NEVER set booking_ready=true if you are asking a question in your message
- NEVER set booking_ready=true until you have: room_name, date, AND start_time
- If your message contains a question mark (?), booking_ready MUST be false
- Be conversational and friendly
- Convert relative dates (tomorrow, next Monday) to actual YYYY-MM-DD format
- Default meeting duration is 1 hour

Required fields before booking_ready can be true:
1. room_name - must match one of the available rooms
2. date - in YYYY-MM-DD format
3. start_time - in HH:MM format

Respond with JSON:
{{
    "message": "Your friendly response (ask ONE question if info missing)",
    "booking_ready": false,
    "booking_data": {{
        "room_name": "Exact room name from list, or null",
        "date": "YYYY-MM-DD or null",
        "start_time": "HH:MM or null",
        "end_time": "HH:MM or null",
        "title": "Meeting purpose or null",
        "booked_by": "Person name or null"
    }}
}}

When ALL required info is collected, respond with booking_ready=true:
{{
    "message": "Great! I have everything. Here's your booking summary: [room] on [date] at [time].",
    "booking_ready": true,
    "booking_data": {{ ... all fields filled ... }}
}}"""

    async def converse(
        self, 
        message: str, 
        history: List[Dict[str, str]], 
        rooms: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Process a conversation turn.
        
        Args:
            message: The user's latest message
            history: Previous conversation turns [{"role": "user/assistant", "content": "..."}]
            rooms: List of available rooms
            
        Returns:
            {
                "message": "AI's response",
                "booking_ready": bool,
                "booking_data": {...} or None
            }
        """
        system_prompt = self._build_system_prompt(rooms)
        
        # Build message list from history
        messages = [SystemMessage(content=system_prompt)]
        
        for turn in history:
            if turn["role"] == "user":
                messages.append(HumanMessage(content=turn["content"]))
            else:
                messages.append(AIMessage(content=turn["content"]))
        
        # Add current message
        messages.append(HumanMessage(content=message))

        try:
            response = await self.llm.ainvoke(messages)
            content = response.content
            
            # Parse JSON from response
            result = self._parse_response(content)
            return result
            
        except Exception as e:
            logger.warning(f"AI Conversation Error: {e}")
            return {
                "message": "I'm sorry, I had trouble understanding that. Could you rephrase your request?",
                "booking_ready": False,
                "booking_data": None,
                "error": str(e)
            }

    def _parse_response(self, content: str) -> Dict[str, Any]:
        """Extract structured data from AI response."""
        try:
            # Try direct JSON parse
            return json.loads(content)
        except json.JSONDecodeError:
            pass
        
        # Try to find JSON in the response
        json_match = re.search(r'\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}', content, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        
        # Fallback: treat entire response as the message
        return {
            "message": content,
            "booking_ready": False,
            "booking_data": None
        }

    # Keep the old parse method for backward compatibility
    async def parse(self, text: str, rooms: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Legacy single-shot parse method."""
        result = await self.converse(text, [], rooms)
        
        # Convert to old format for compatibility
        booking_data = result.get("booking_data") or {}
        return {
            "room_name": booking_data.get("room_name"),
            "date": booking_data.get("date"),
            "start_time": booking_data.get("start_time"),
            "end_time": booking_data.get("end_time"),
            "title": booking_data.get("title"),
            "booked_by": booking_data.get("booked_by"),
            "confidence": "high" if result.get("booking_ready") else "low",
            "clarification_needed": result.get("message") if not result.get("booking_ready") else None
        }
