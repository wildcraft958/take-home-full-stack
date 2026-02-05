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
    
    Supported AI_PROVIDER values:
    - 'openrouter': Uses OpenRouter API (default)
    - 'openai': Uses OpenAI API directly
    - 'ollama': Uses local Ollama instance
    """

    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "openrouter").lower()
        self.model_name = os.getenv("AI_MODEL", "qwen/qwen3-4b:free")
        
        # Ollama configuration
        self.ollama_model = os.getenv("OLLAMA_MODEL", "gemma3:1b")
        self.ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

        if self.provider == "ollama":
            from langchain_community.chat_models import ChatOllama
            self.llm = ChatOllama(
                model=self.ollama_model,
                base_url=self.ollama_base_url
            )
        elif self.provider == "openrouter":
            # OpenRouter uses OpenAI-compatible API
            api_key = os.getenv("OPENROUTER_API_KEY")
            self.llm = ChatOpenAI(
                model=self.model_name,
                api_key=api_key,
                base_url="https://openrouter.ai/api/v1"
            )
        else:
            # Default: OpenAI direct
            api_key = os.getenv("OPENAI_API_KEY")
            base_url = os.getenv("OPENAI_BASE_URL")  # Optional custom endpoint
            self.llm = ChatOpenAI(
                model=self.model_name,
                api_key=api_key,
                base_url=base_url
            )


    def _build_system_prompt(self, rooms: List[Dict[str, Any]]) -> str:
        """Construct the system prompt for the conversational agent."""
        room_list = "\n".join([f"- {r['name']} (capacity: {r['capacity']})" for r in rooms])
        today = datetime.now().strftime("%Y-%m-%d (%A)")

        return f"""You are a smart booking assistant. Your goal is to book a meeting room as EFFICIENTLY as possible.

Available Rooms:
{room_list}

Today's Date: {today}

INSTRUCTIONS:
1. ANALYZE the user's message and the conversation history.
2. EXTRACT every piece of information provided (Room, Date, Time, Capacity).
3. IF user specifies a relative date (e.g., "tomorrow"), CALCULATE the actual YYYY-MM-DD.
4. IF user says "any room" or doesn't care, PICK the best room based on capacity (or random if not specified). DO NOT ask which room if they said "any".
5. DO NOT ask for information that has already been provided.

CRITICAL RULES:
- If user provides ALL needed info (Room/Capacity, Date, Time), set booking_ready=true IMMEDIATELY.
- If user needs a room for X people, auto-select a room that fits.
- If multiple inputs are given, accept them all at once.
- Default duration is 1 hour if not specified.

Required Final Output (JSON):
{{
    "message": "Response text. If booking ready, summarize: 'Booking [Room] for [Date] at [Time]'. If missing info, ask for it.",
    "booking_ready": boolean,
    "booking_data": {{
        "room_name": "Selected Room Name (REQUIRED for true)",
        "date": "YYYY-MM-DD (REQUIRED for true)",
        "start_time": "HH:MM (REQUIRED for true)",
        "end_time": "HH:MM",
        "title": "Topic",
        "booked_by": "Name"
    }}
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
        messages = []
        
        # Some models (like Google Gemma on OpenRouter) don't support SystemMessage
        # We merge system prompt into the first user message for these cases
        is_google_openrouter = (self.provider == "openrouter" and "google/" in self.model_name.lower())
        
        if not is_google_openrouter:
            messages.append(SystemMessage(content=system_prompt))
        
        for turn in history:
            if turn["role"] == "user":
                messages.append(HumanMessage(content=turn["content"]))
            else:
                messages.append(AIMessage(content=turn["content"]))
        
        # Add current message
        messages.append(HumanMessage(content=message))

        # If we couldn't use SystemMessage, prepend it to the first HumanMessage
        if is_google_openrouter:
            for msg in messages:
                if isinstance(msg, HumanMessage):
                    msg.content = f"SYSTEM INSTRUCTIONS:\n{system_prompt}\n\nUSER REQUEST:\n{msg.content}"
                    break

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
