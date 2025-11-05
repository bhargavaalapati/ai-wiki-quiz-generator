# backend/database.py
import json
import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Read the DATABASE_URL from the environment
# Use SQLite as a fallback for local development
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./quiz_history.db")

# Remove SQLite-only argument if using Postgres
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# --- SQLAlchemy Model ---
class QuizHistory(Base):
    __tablename__ = "quiz_history"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    title = Column(String)
    date_generated = Column(DateTime, default=datetime.utcnow)

    # Store the complex JSON output as a serialized string
    # This is crucial for storing nested LLM output
    full_quiz_data = Column(Text)

    def set_full_data(self, data: dict):
        self.full_quiz_data = json.dumps(data)

    def get_full_data(self) -> dict:
        return json.loads(self.full_quiz_data) if self.full_quiz_data else {}


# Create the database tables
Base.metadata.create_all(bind=engine)


# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
