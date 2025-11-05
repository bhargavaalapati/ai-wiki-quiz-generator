from pydantic import BaseModel, Field
from typing import List, Dict, Any
from datetime import datetime

# --- Pydantic Schemas for LLM Output ---
# This defines the strict JSON structure we want the LLM to return.


class Flashcard(BaseModel):
    term: str = Field(description="The key concept, person, or term")
    definition: str = Field(
        description="A concise, one-sentence definition based on the article text"
    )


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
    flashcards: List[Flashcard] = Field(
        description="A list of 5-10 key concept flashcards from the article"
    )


# --- Pydantic Schemas for API Endpoints ---


class GenerateQuizRequest(BaseModel):
    url: str


# For the /history endpoint response
class HistoryItem(BaseModel):
    id: int
    url: str
    title: str
    date_generated: datetime

    class Config:
        from_attributes = True
