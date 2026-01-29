from pydantic import BaseModel, Field
from typing import List, Dict
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from database import Base

# --- Pydantic Schemas for LLM Output ---


class QuizQuestion(BaseModel):
    question: str = Field(description="The question text")
    options: List[str] = Field(description="A list of four options (A, B, C, D)")
    answer: str = Field(
        description="The correct answer text, must be one of the options"
    )
    difficulty: str = Field(description="Difficulty level (easy, medium, or hard)")
    explanation: str = Field(description="A short explanation for the correct answer")


class QuizOutput(BaseModel):
    title: str = Field(description="The official title of the Wikipedia article")
    summary: str = Field(description="A 2-3 sentence summary of the article")
    key_entities: Dict[str, List[str]] = Field(
        description="A dictionary mapping entity types (e.g., people, organizations, locations) to a list of names"
    )
    sections: List[str] = Field(
        description="A list of main section headings from the article"
    )
    quiz: List[QuizQuestion] = Field(
        description="A list of 5-10 generated quiz questions"
    )
    related_topics: List[str] = Field(
        description="A list of 3-5 suggested related Wikipedia topics for further reading"
    )


# --- Pydantic Schemas for API Endpoints ---


class GenerateQuizRequest(BaseModel):
    url: str


class HistoryItem(BaseModel):
    id: int
    url: str
    title: str
    date_generated: datetime

    class Config:
        from_attributes = True


class UserUsage(Base):
    __tablename__ = "user_usage"

    ip_address = Column(String, primary_key=True, index=True)
    count = Column(Integer, default=0)
    window_start = Column(DateTime, default=datetime.utcnow)
