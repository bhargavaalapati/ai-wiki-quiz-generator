# 🧠 AI Wiki Quiz Generator

This is a production-ready Full-Stack application that accepts a Wikipedia article URL, scrapes its content, and uses Google's Gemini Pro LLM to automatically generate a structured interactive quiz.

The system features robust backend caching, a persistent cloud database, and a resilient "Optimistic UI" that ensures instant feedback even during generation.

## ✨ Features

### Core Functionality

- **🔗 Universal Scraper:** Accepts any `en.wikipedia.org` URL and extracts clean, relevant text.
- **🤖 AI Quiz Generation:** Uses **Gemini 1.5 Flash** (via LangChain) to generate:
- Article Summary & Title
- 5-10 Multiple Choice Questions (with difficulty levels & explanations)
- Key Entities (People, Locations, Organizations)
- Related Topics

- **💾 Cloud Persistence:** Saves every generated quiz to a **Supabase (PostgreSQL)** database.
- **📜 History Dashboard:** View a list of all past quizzes with instant "Optimistic UI" updates.

### 🏆 Advanced Engineering

- **⚡ Backend Caching:** Checks the database before calling the AI. If a URL has been processed before, it returns the cached result instantly (0 cost, 0 latency).
- **🎨 Interactive Quiz Mode:** A dedicated "Play Mode" where users can answer questions one by one, get real-time feedback, and see their final score.
- **🛡️ Rigid Validation:** Regex-based input validation ensures only valid Wikipedia URLs are processed, saving API quota.
- **🚀 Background Generation:** Users can switch tabs or browse history while a new quiz generates in the background without interrupting the process.

---

## 🛠️ Tech Stack

| Category       | Technology                              |
| -------------- | --------------------------------------- |
| **Frontend**   | React (Vite), Emotion (CSS-in-JS)       |
| **Backend**    | Python, FastAPI, Uvicorn                |
| **Database**   | PostgreSQL (Supabase)                   |
| **ORM**        | SQLAlchemy                              |
| **AI / LLM**   | Google Gemini 1.5 Flash (via LangChain) |
| **Deployment** | Vercel (Frontend) + Render (Backend)    |

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

| Method | Endpoint         | Description                                                         |
| ------ | ---------------- | ------------------------------------------------------------------- |
| `POST` | `/generate_quiz` | Scrapes URL, generates quiz via AI, saves to DB (or returns Cache). |
| `GET`  | `/history`       | Returns a list of all generated quizzes (ID, Title, URL).           |
| `GET`  | `/quiz/{id}`     | Returns the full JSON quiz data for a specific ID.                  |

---

## 🧠 System Prompt (LangChain)

To ensure consistent JSON output, we use a strict system prompt with `JsonOutputParser`:

```text
You are an expert quizmaster and content analyst.
Your task is to generate a comprehensive JSON object based on the provided Wikipedia article text.

Instructions:
1. Analyze the Text: Read the article to understand main points.
2. Generate Data: Extract Title, Summary, and Key Entities.
3. Quiz Questions: Generate 5-10 multiple-choice questions.
   - 4 Options per question.
   - Clear correct answer and concise explanation.
   - Difficulty level (Easy/Medium/Hard).
4. Related Topics: Suggest 3-5 related Wikipedia topics.

Output must strictly adhere to the provided JSON Schema.

```

---

## 📦 Deployment

- **Frontend:** Deployed on **Vercel**.
- **Backend:** Deployed on **Render**. Configured with `CORSMiddleware` to allow requests from the Vercel domain.
- **Database:** Hosted on **Supabase**. Connected via Transaction Pooler (Port 6543) for serverless stability.
