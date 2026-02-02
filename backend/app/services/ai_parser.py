import os
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field

# Define structured output
class BookingExtraction(BaseModel):
    room_name: Optional[str] = Field(description="The exact room name if mentioned, otherwise null")
    room_requirements: Optional[Dict[str, int]] = Field(description="Requirements like min_capacity if no room specified")
    date: Optional[str] = Field(description="Date in YYYY-MM-DD format")
    start_time: Optional[str] = Field(description="Start time in HH:MM (24h) format")
    end_time: Optional[str] = Field(description="End time in HH:MM (24h) format")
    booked_by: Optional[str] = Field(description="Name of the person booking")
    title: Optional[str] = Field(description="Title or purpose of the meeting")
    confidence: str = Field(description="high, medium, or low")
    clarification_needed: Optional[str] = Field(description="Question to ask user if information is missing")

class AIBookingParser:
    """
    Natural language parser using LangChain.
    Supports OpenRouter and Ollama.
    """

    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "openai") # openai (for OpenRouter) or ollama
        self.api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
        self.base_url = os.getenv("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
        self.model_name = os.getenv("AI_MODEL", "openai/gpt-3.5-turbo") # Default for OpenRouter

        if self.provider == "ollama":
            from langchain_community.chat_models import ChatOllama
            self.llm = ChatOllama(model="llama3") # Default local model, can be env var
        else:
            # OpenRouter / OpenAI
            self.llm = ChatOpenAI(
                model=self.model_name,
                api_key=self.api_key,
                base_url=self.base_url
            )

        # Create the extraction chain
        self.structured_llm = self.llm.with_structured_output(BookingExtraction)

    async def parse(self, text: str, rooms: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Parse natural language text into structured booking data.
        """
        
        room_list = "\n".join([f"- {r['name']} (cap: {r['capacity']})" for r in rooms])
        today = datetime.now().strftime("%Y-%m-%d %A")

        system_prompt = f"""You are a booking assistant. Extract meeting details.
        
        Available Rooms:
        {room_list}
        
        Current Date: {today}
        
        Rules:
        - Match room names fuzzily if needed.
        - Calculate end_time from duration (default 1h).
        - Convert relative dates (tomorrow, next Fri) to YYYY-MM-DD.
        - If info is missing (date, time, room), set clarification_needed.
        """

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("user", "{input}")
        ])

        chain = prompt | self.structured_llm
        
        try:
            result = await chain.ainvoke({"input": text})
            return result.dict()
        except Exception as e:
            # Fallback or error handling
            print(f"AI Parse Error: {e}")
            return {
                "confidence": "low", 
                "clarification_needed": "Sorry, I couldn't understand that request. Please try again.",
                "raw_text": text
            }
