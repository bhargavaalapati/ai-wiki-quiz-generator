from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import database, models, scraper, llm_quiz_generator
from database import engine, get_db, QuizHistory
from models import GenerateQuizRequest, HistoryItem
from fastapi import Request, HTTPException, status
from datetime import datetime, timedelta
from models import UserUsage

# Create DB tables
database.Base.metadata.create_all(bind=engine)

app = FastAPI(title="DeepKlarity AI Wiki Quiz Generator")

origins = [
    "http://localhost:5173",
    "https://ai-wiki-quiz-generator-three.vercel.app",
]

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- RATE LIMITER LOGIC ---
MAX_REQUESTS_PER_HOUR = 2


def check_rate_limit(request: Request, db: Session = Depends(get_db)):
    # 1. Get User IP
    client_ip = request.client.host

    # 2. Check Database
    usage = db.query(UserUsage).filter(UserUsage.ip_address == client_ip).first()

    now = datetime.utcnow()

    # 3. Logic
    if not usage:
        # First time user
        new_usage = UserUsage(ip_address=client_ip, count=1, window_start=now)
        db.add(new_usage)
        db.commit()
        return

    # Check if hour has passed
    if now - usage.window_start > timedelta(hours=1):
        # Reset window
        usage.count = 1
        usage.window_start = now
        db.commit()
        return

    # Check limit
    if usage.count >= MAX_REQUESTS_PER_HOUR:
        # Calculate time remaining
        reset_time = usage.window_start + timedelta(hours=1)
        minutes_left = int((reset_time - now).total_seconds() / 60)

        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. You have used your {MAX_REQUESTS_PER_HOUR} free quizzes. Try again in {minutes_left} minutes.",
        )

    # Increment count
    usage.count += 1
    db.commit()


# --- API Endpoints ---


@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Wiki Quiz Generator API"}


@app.post("/generate_quiz", dependencies=[Depends(check_rate_limit)])
def generate_quiz(request: GenerateQuizRequest, db: Session = Depends(get_db)):
    try:
        print(f"--- Processing URL: {request.url} ---")

        # --- 1. CACHE CHECK (The Money Saver) ---
        existing_quiz = (
            db.query(QuizHistory).filter(QuizHistory.url == request.url).first()
        )

        if existing_quiz:
            print(
                f"--- [CACHE HIT] Found quiz ID: {existing_quiz.id}. Returning from DB. ---"
            )
            # Get stored quiz data
            cached_data = existing_quiz.get_full_data().copy()

            # Inject missing fields so frontend always gets them
            cached_data["id"] = existing_quiz.id
            cached_data["created_at"] = existing_quiz.date_generated.isoformat()

            return cached_data

        # --- 2. CACHE MISS → Generate fresh quiz ---
        print("--- [CACHE MISS] URL not found. Starting fresh generation. ---")

        # Scrape Wikipedia
        title, article_text = scraper.scrape_wikipedia(request.url)
        if not article_text:
            raise HTTPException(status_code=400, detail="Could not scrape content.")

        # Generate quiz using AI
        quiz_data = llm_quiz_generator.generate_quiz_data(article_text)
        quiz_data["url"] = request.url

        # Save to Database
        db_record = QuizHistory(
            url=request.url,
            title=quiz_data.get("title", "Unknown Title"),
        )
        db_record.set_full_data(quiz_data)

        db.add(db_record)
        db.commit()
        db.refresh(db_record)  # Generates the ID

        # --- FIX: Inject ID + created_at into response ---
        response_payload = quiz_data.copy()
        response_payload["id"] = db_record.id
        response_payload["created_at"] = db_record.date_generated.isoformat()

        return response_payload

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history", response_model=list[HistoryItem])
def get_quiz_history(db: Session = Depends(get_db)):
    """
    Returns a list of all previously generated quizzes.
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

    return db_record.get_full_data()
