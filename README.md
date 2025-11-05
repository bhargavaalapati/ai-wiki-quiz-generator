# AI Wiki Quiz Generator

This is a full-stack application that accepts a Wikipedia article URL, scrapes its content, and uses a Large Language Model (Gemini) to automatically generate a structured quiz, key concept flashcards, and a summary based on the article's text.

The system saves all generated quizzes and allows users to browse a history of past quizzes, view details, and even take the quizzes in an interactive "quiz mode."

## ✨ Features

### Core Functionality

- **Generate Quiz from URL:** Accepts any `en.wikipedia.org` URL.
- **AI Quiz Generation:** Uses the Gemini LLM (via LangChain) to generate a full JSON payload containing:
  - Article Title & Summary
  - Key Entities (People, Orgs, Locations)
  - 5-10 Quiz Questions (with options, answer, and explanation)
  - Related Topics
- **Database History:** Saves every generated quiz to a persistent SQLite database.
- **History Tab:** Displays a clean, searchable table of all previously generated quizzes.
- **Details Modal:** Allows users to click "Details" on any history item to view the full quiz.

### 🏆 Bonus Features Implemented

- **"Take Quiz" Mode:** An interactive mode that lets users take the generated quiz, get a score, and see the correct/incorrect answers.
- **Backend Caching:** The API first checks the database for an existing URL to prevent duplicate scraping and API calls, making subsequent requests instantaneous.
- **Frontend URL Validation:** The input field provides real-time validation to ensure only valid `https://en.wikipedia.org/wiki/...` URLs are submitted.

### 💡 Innovative Feature

- **Key Concept Flashcards:** The AI _also_ generates a deck of 5-10 key concept flashcards based on the article, complete with terms and concise definitions. The UI includes an interactive "click to flip" flashcard deck.

---

## 🛠️ Tech Stack

| Category     | Technology                        |
| ------------ | --------------------------------- |
| **Backend**  | Python, FastAPI, SQLAlchemy       |
| **Frontend** | React (Vite), JavaScript          |
| **UI**       | Bootstrap 5                       |
| **Database** | SQLite                            |
| **AI / LLM** | Google Gemini API (via LangChain) |
| **Scraping** | BeautifulSoup4, Requests          |

---

## 🚀 Setup & Installation

### 1\. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a Python virtual environment:
    ```bash
    python -m venv venv
    ```
3.  Activate the environment:

    ```bash
    # On Windows
    venv\Scripts\activate

    # On macOS/Linux
    source venv/bin/activate
    ```

4.  Install all required packages:
    ```bash
    pip install -r requirements.txt
    ```
5.  Create a `.env` file in the `backend` directory:
    ```
    GEMINI_API_KEY="YOUR_GOOGLE_API_KEY_HERE"
    ```
6.  Run the FastAPI server:
    ```bash
    uvicorn main:app --reload
    ```
    The server will be running at `http://127.0.0.1:8000`.

### 2\. Frontend Setup

1.  Navigate to the `frontend` directory in a **new terminal**:
    ```bash
    cd frontend
    ```
2.  Install all `npm` packages:
    ```bash
    npm install
    ```
3.  Run the React development server:
    ```bash
    npm run dev
    ```
    The app will be running at `http://localhost:5173/`.

---

## 📡 API Endpoints

| Method | Endpoint          | Description                                                                                                 |
| ------ | ----------------- | ----------------------------------------------------------------------------------------------------------- |
| `POST` | `/generate_quiz`  | Accepts a JSON body `{"url": "..."}`. Scrapes, generates, and saves a new quiz. Returns the full quiz JSON. |
| `GET`  | `/history`        | Returns a JSON list of all previously generated quizzes (ID, title, URL, date).                             |
| `GET`  | `/quiz/{quiz_id}` | Returns the full JSON data for a single quiz by its ID.                                                     |

---

## 🧠 LangChain Prompt Template

This is the prompt template used in `llm_quiz_generator.py` to ensure consistent, structured JSON output from the Gemini API.

```python
# This is a unique number to force a new response: {random_number}

You are an expert quizmaster and content analyst.
Your task is to generate a comprehensive JSON object based on the provided Wikipedia article text.
The JSON object must strictly adhere to the provided Pydantic schema.

**Article Text:**
---
{article_text}
---

**Instructions:**
1.  **Analyze the Text:** Read the entire article to understand its main points, key figures, and structure.
2.  **Generate Data:** Populate all fields in the JSON schema.
3.  **Quiz Questions (CRITICAL):**
    * Generate 5-10 high-quality questions.
    * Questions must be diverse, covering different parts of the article.
    * Options must be plausible, with one clearly correct answer based *only* on the text.
    * Difficulty (easy, medium, hard) must be assigned appropriately.
    * Explanations must be concise and reference why the answer is correct according to the text.
4.  **Key Entities:** Extract people, organizations, and locations. If none are found, return an empty list for that key.
5.  **Related Topics:** Suggest topics that are conceptually related to the main article.
6.  **Flashcards:** Generate 5-10 high-quality flashcards for the *most important* terms, people, or concepts in the article. Each flashcard must have a 'term' and a concise 'definition'.

**Output Format Instructions:**
{format_instructions}

**Final JSON Output:**
```

---

## 🖼️ Screenshots

Check the /screenshots folder for the images of this! after cloning!

---

## 📦 Sample Data

See the `sample_data/` folder for an example of:

- `mahesh_babu.json`: The full JSON API output for a sample article.
- `tested_urls.txt`: A list of other URLs tested.
