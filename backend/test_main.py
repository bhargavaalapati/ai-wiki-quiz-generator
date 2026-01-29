import pytest
from fastapi.testclient import TestClient
from main import app, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, QuizHistory
from models import UserUsage

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
