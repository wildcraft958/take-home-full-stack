"""
AI Booking Parser Service

This module provides natural language parsing for booking requests using LangChain.
Supports both OpenAI/OpenRouter and Ollama as AI providers.
"""

import os
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field  # Use LangChain's pydantic v1


class BookingExtraction(BaseModel):
    """Schema for extracted booking information."""
    room_name: Optional[str] = Field(default=None, description="The exact room name if mentioned")
    room_requirements: Optional[Dict[str, int]] = Field(default=None, description="Requirements like min_capacity")
    date: Optional[str] = Field(default=None, description="Date in YYYY-MM-DD format")
    start_time: Optional[str] = Field(default=None, description="Start time in HH:MM format")
    end_time: Optional[str] = Field(default=None, description="End time in HH:MM format")
    booked_by: Optional[str] = Field(default=None, description="Name of the person booking")
    title: Optional[str] = Field(default=None, description="Title or purpose of the meeting")
    confidence: str = Field(default="medium", description="high, medium, or low")
    clarification_needed: Optional[str] = Field(default=None, description="Question to ask if info missing")


class AIBookingParser:
    """
    Natural language parser for room booking requests.
    
    Supports:
    - OpenAI / OpenRouter (via OPENAI_API_KEY or OPENROUTER_API_KEY)
    - Ollama (local models, set AI_PROVIDER=ollama)
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
            # Ollama doesn't support structured output, use JSON parser
            self.use_structured_output = False
        else:
            self.llm = ChatOpenAI(
                model=self.model_name,
                api_key=self.api_key,
                base_url=self.base_url
            )
            self.use_structured_output = True

        # JSON output parser for Ollama fallback
        self.json_parser = JsonOutputParser(pydantic_object=BookingExtraction)

    def _build_system_prompt(self, rooms: List[Dict[str, Any]]) -> str:
        """Construct the system prompt with room context."""
        room_list = "\n".join([f"- {r['name']} (capacity: {r['capacity']})" for r in rooms])
        today = datetime.now().strftime("%Y-%m-%d (%A)")

        return f"""You are a booking assistant. Extract meeting room booking details from user requests.

Available Rooms:
{room_list}

Today's Date: {today}

Extraction Rules:
1. Match room names flexibly (e.g., "board room" -> "Board Room")
2. Convert relative dates: "tomorrow" -> actual date, "next Monday" -> actual date
3. If duration given (e.g., "1 hour"), calculate end_time from start_time
4. Default duration is 1 hour if not specified
5. Set confidence to "low" if critical info (room, date, time) is missing
6. Set clarification_needed with a question if you need more information

Respond with ONLY valid JSON. Example format:
room_name: string or null
room_requirements: object or null
date: YYYY-MM-DD string or null
start_time: HH:MM string or null
end_time: HH:MM string or null
booked_by: string or null
title: string or null
confidence: "high" or "medium" or "low"
clarification_needed: string or null"""

    async def parse(self, text: str, rooms: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Parse natural language text into structured booking data.
        
        Args:
            text: The user's natural language booking request.
            rooms: List of available rooms with name and capacity.
            
        Returns:
            Extracted booking information as a dictionary.
        """
        from langchain_core.messages import SystemMessage, HumanMessage
        
        system_prompt = self._build_system_prompt(rooms)
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=text)
        ]

        try:
            if self.use_structured_output:
                # OpenAI with structured output
                structured_llm = self.llm.with_structured_output(BookingExtraction)
                result = await structured_llm.ainvoke(messages)
                return result.dict()
            else:
                # Ollama - invoke directly and parse JSON
                response = await self.llm.ainvoke(messages)
                content = response.content
                
                # Try to extract JSON from the response
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    # Try to find JSON object in the response
                    import re
                    # Match nested JSON objects
                    json_match = re.search(r'\{(?:[^{}]|\{[^{}]*\})*\}', content, re.DOTALL)
                    if json_match:
                        return json.loads(json_match.group())
                    raise ValueError(f"Could not parse JSON from response: {content}")
                
        except Exception as e:
            print(f"AI Parse Error: {e}")
            return {
                "room_name": None,
                "date": None,
                "start_time": None,
                "end_time": None,
                "booked_by": None,
                "title": None,
                "confidence": "low",
                "clarification_needed": "Sorry, I couldn't process that request. Please try again or use the manual form.",
                "raw_text": text,
                "error": str(e)
            }
