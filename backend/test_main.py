import pytest
from fastapi.testclient import TestClient
from main import app, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, QuizHistory
from models import UserUsage
from unittest.mock import patch

# 1. Setup a Temporary Test Database (SQLite in memory)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# 2. Override the Dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

# 3. Create the Test Client
client = TestClient(app)


# 4. Setup/Teardown logic
@pytest.fixture(scope="module", autouse=True)
def setup_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables after tests (Cleanup)
    Base.metadata.drop_all(bind=engine)


# --- THE TESTS ---


def test_read_root():
    """Check if the API is alive"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the AI Wiki Quiz Generator API"}


def test_get_history_empty():
    """History should be empty initially"""
    response = client.get("/history")
    assert response.status_code == 200
    assert response.json() == []


def test_rate_limiting():
    """
    Test that the Rate Limiter blocks the 3rd request.
    """
    # 1. Reset Rate Limit for this IP (Manually clear DB for test)
    db = TestingSessionLocal()
    db.query(UserUsage).delete()
    db.commit()
    db.close()

    # We use a dummy URL. It doesn't matter if scraping fails (500) or works (200),
    # as long as it counts towards the limit.
    payload = {"url": "https://en.wikipedia.org/wiki/Test_Rate_Limit"}

    print("\n--- Sending Request 1 ---")
    client.post("/generate_quiz", json=payload)

    print("--- Sending Request 2 ---")
    client.post("/generate_quiz", json=payload)

    print("--- Sending Request 3 (Should Fail) ---")
    response3 = client.post("/generate_quiz", json=payload)

    # Assertions
    if response3.status_code == 429:
        print("✅ SUCCESS: Rate limit hit as expected!")
        assert "Rate limit exceeded" in response3.json()["detail"]
    else:
        print(f"❌ FAILED: Expected 429, got {response3.status_code}")
        # This assert will fail the test if the status isn't 429
        assert response3.status_code == 429


def test_generate_quiz_success():
    """
    Test a successful quiz generation by MOCKING the AI response.
    This verifies the DB save and Response format without calling Gemini.
    """
    # 1. Fake Data to return instead of calling Google
    mock_ai_response = {
        "title": "Mock Quiz",
        "summary": "This is a fake summary.",
        "key_entities": {"people": ["Tester"]},
        "sections": ["Intro"],
        "quiz": [],
        "related_topics": [],
    }

    # 2. Patch 'scrape_wikipedia' to return dummy text
    with patch("scraper.scrape_wikipedia") as mock_scrape:
        mock_scrape.return_value = ("Mock Title", "Mock Article Text")

        # 3. Patch 'generate_quiz_data' to return our Fake JSON
        with patch("llm_quiz_generator.generate_quiz_data") as mock_llm:
            mock_llm.return_value = mock_ai_response

            # 4. Make the Request
            payload = {"url": "https://en.wikipedia.org/wiki/Mock_Test"}
            response = client.post("/generate_quiz", json=payload)

            # 5. Verify it worked
            assert response.status_code == 200
            assert response.json()["title"] == "Mock Quiz"
            assert "id" in response.json()  # Did it generate an ID?
