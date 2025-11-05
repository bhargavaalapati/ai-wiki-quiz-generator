import json
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import database, models, scraper, llm_quiz_generator
from database import engine, get_db, QuizHistory
from models import GenerateQuizRequest, HistoryItem

# Create DB tables
database.Base.metadata.create_all(bind=engine)

app = FastAPI(title="DeepKlarity AI Wiki Quiz Generator")


origins = [
    "http://localhost:5173",
    "https://ai-wiki-quiz-generator-three.vercel.app/",
]

# --- CORS Middleware ---
# This allows our React frontend (running on a different port)
# to communicate with this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoints ---


@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Wiki Quiz Generator API"}


@app.post("/generate_quiz")
def generate_quiz(request: GenerateQuizRequest, db: Session = Depends(get_db)):
    try:
        # --- 1. Cache Check ---
        cached_result = (
            db.query(QuizHistory).filter(QuizHistory.url == request.url).first()
        )
        if cached_result:
            print(
                f"--- [Cache Hit] Found ID: {cached_result.id}. Returning from DB. ---"
            )
            return cached_result.get_full_data()

        print("--- [Cache Miss] URL not found in DB. Starting new generation. ---")

        # --- 2. Scrape Wikipedia ---
        print(f"Scraping URL: {request.url}")
        title, article_text = scraper.scrape_wikipedia(request.url)

        if not article_text:
            raise HTTPException(
                status_code=400, detail="Could not scrape any content from the URL."
            )

        print("Generating quiz data via LLM...")
        quiz_data = llm_quiz_generator.generate_quiz_data(article_text)

        # Add URL to the data before saving
        quiz_data["url"] = request.url

        # --- 4. Save to Database ---
        print("Saving to database...")
        db_record = QuizHistory(
            url=request.url,
            title=quiz_data.get(
                "title", "Unknown Title"
            ),  # This will now be "TEST: Coffee"
        )
        db_record.set_full_data(quiz_data)

        db.add(db_record)
        db.commit()
        db.refresh(db_record)

        print(f"Successfully processed and saved quiz ID: {db_record.id}")

        # --- 5. Return Full JSON Data ---
        return quiz_data

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history", response_model=list[HistoryItem])
def get_quiz_history(db: Session = Depends(get_db)):
    """
    Returns a list of all previously generated quizzes
    (id, url, title, date_generated only).
    """
    history = db.query(QuizHistory).order_by(QuizHistory.date_generated.desc()).all()
    return history


@app.get("/quiz/{quiz_id}")
def get_quiz_details(quiz_id: int, db: Session = Depends(get_db)):
    """
    Fetches the full JSON data for a single quiz by its ID.
    """
    db_record = db.query(QuizHistory).filter(QuizHistory.id == quiz_id).first()

    if not db_record:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Deserialize the 'full_quiz_data' string back into a dict
    return db_record.get_full_data()
