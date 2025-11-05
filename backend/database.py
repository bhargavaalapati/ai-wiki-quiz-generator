# backend/database.py
import json
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Use SQLite for this 4-hour sprint.
# The .db file will be created in the 'backend' directory.
SQLALCHEMY_DATABASE_URL = "sqlite:///./quiz_history.db"

# NOTE: If you MUST use PostgreSQL (and have it running, e.g., via Docker):
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/dbname"
# You'd also need to pip install psycopg2-binary

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False} # check_same_thread is only for SQLite
)
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