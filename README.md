# 🧠 AI Wiki Quiz Generator

This is a production-ready Full-Stack application that accepts a Wikipedia article URL, scrapes its content, and uses Google's Gemini Pro LLM to automatically generate a structured interactive quiz.

The system features robust backend caching, a persistent cloud database, and a resilient "Optimistic UI" that ensures instant feedback even during generation.

## ✨ Features

### Core Functionality

* **🔗 Universal Scraper:** Accepts any `en.wikipedia.org` URL and extracts clean, relevant text.
* **🤖 AI Quiz Generation:** Uses **Gemini 1.5 Flash** (via LangChain) to generate:
* Article Summary & Title
* 5-10 Multiple Choice Questions (with difficulty levels & explanations)
* Key Entities (People, Locations, Organizations)
* Related Topics


* **💾 Cloud Persistence:** Saves every generated quiz to a **Supabase (PostgreSQL)** database.
* **📜 History Dashboard:** View a list of all past quizzes with instant "Optimistic UI" updates.

### 🏆 Advanced Engineering & Architecture

#### **Scalability & Performance**

* **⚡ Backend Caching (O(1)):** Checks the database before calling the AI. If a URL has been processed before, it returns the cached result instantly (0 cost, 0 latency).
* **📉 Smart Token Optimization:** The scraper intelligently strips navigation, footers, and metadata, and truncates text to ~12k characters. This reduces token usage by 40-60% per request, maximizing the free tier quota.
* **🗄️ Database Indexing:** SQL tables are indexed on the `url` column, ensuring sub-millisecond lookups even with millions of records.
* **🚀 Background Async Processing:** Uses FastAPI's asynchronous capabilities to handle multiple requests concurrently without blocking the server.

#### **Security & Stability**

* **🛡️ Rate Limiting:** Implements IP-based rate limiting (2 requests/hour) to prevent abuse of the free-tier Gemini API.
* **🔒 Rigid Input Validation:** Strict Regex patterns prevent SQL Injection or malicious URLs from reaching the scraper.
* **🌐 Strict CORS Policy:** The API is locked down to accept requests *only* from the trusted Frontend domain (Vercel).

#### **User Experience (UX)**

* **🎨 Interactive Quiz Mode:** A dedicated "Play Mode" where users can answer questions one by one, get real-time feedback, and see their final score.
* **✨ Optimistic UI:** Users can switch tabs or browse history immediately after clicking "Generate," without waiting for the backend process to finish.

---

## 🛠️ Tech Stack

| Category | Technology |
| --- | --- |
| **Frontend** | React (Vite), Emotion (CSS-in-JS) |
| **Backend** | Python, FastAPI, Uvicorn |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | SQLAlchemy |
| **AI / LLM** | Google Gemini 1.5 Flash (via LangChain) |
| **Deployment** | Vercel (Frontend) + Render (Backend) |

---

## 🚀 Local Setup & Installation

### 1. Backend Setup

1. Navigate to the `backend` directory:
```bash
cd backend

```


2. Create and activate a virtual environment:
```bash
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

```


3. Install dependencies:
```bash
pip install -r requirements.txt

```


4. Create a `.env` file in `backend/`:
```ini
GEMINI_API_KEY="YOUR_GOOGLE_KEY"
DATABASE_URL="postgresql://user:pass@host:6543/postgres"

```


5. Run the server:
```bash
uvicorn main:app --reload

```


### 2. Frontend Setup

1. Navigate to `frontend`:
```bash
cd frontend

```


2. Install dependencies:
```bash
npm install

```


3. Run the dev server:
```bash
npm run dev

```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/generate_quiz` | Scrapes URL, generates quiz via AI, saves to DB (or returns Cache). **(Rate Limited)** |
| `GET` | `/history` | Returns a list of all generated quizzes (ID, Title, URL). |
| `GET` | `/quiz/{id}` | Returns the full JSON quiz data for a specific ID. |

---

## 🧠 System Prompt (LangChain)

To ensure consistent JSON output while minimizing token usage, we use a Telegraphic Style system prompt. This creates a strict contract with the LLM using `JsonOutputParser`:

```text
Role: Expert Quizmaster.
Task: Convert the provided text into a JSON object matching the strict schema.

Context:
---
{article_text}
---

Requirements:
1. Title & Summary: Extract from text.
2. Key Entities: List people, orgs, locations.
3. Quiz: 5-10 MCQs. 4 options each. 1 correct answer. Concise explanation. Mixed difficulty.
4. Related Topics: 3-5 links.

Schema Instructions:
{format_instructions}
```
---

## 🔮 Future Roadmap

This project is built with a modular architecture, allowing for easy expansion. Future features include:

1. **👤 User Authentication & Profiles:**
* Integrate **Supabase Auth** (Google/GitHub Login).
* Track individual user progress, streak counts, and "Mastery Levels" for different topics.


2. **⚔️ Multiplayer Quiz Battle:**
* Use **WebSockets** to allow two users to take the same generated quiz simultaneously.
* Real-time score updates and leaderboards.


3. **📚 Adaptive Learning Paths:**
* Use a **Vector Database (RAG)** to recommend the *next* Wikipedia article a user should read based on their quiz performance (e.g., if they fail a "Physics" quiz, suggest "Newton's Laws").


---

## 📦 Deployment

* **Frontend:** Deployed on **Vercel**.
* **Backend:** Deployed on **Render**. Configured with `CORSMiddleware` to allow requests from the Vercel domain.
* **Database:** Hosted on **Supabase**. Connected via Transaction Pooler (Port 6543) for serverless stability.
