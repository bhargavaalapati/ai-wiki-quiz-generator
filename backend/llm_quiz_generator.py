import os
import random
import time
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from models import QuizOutput

# Load API key from .env
load_dotenv()


def generate_quiz_data(article_text: str) -> dict:
    """
    Generates quiz data from article text using Gemini and LangChain.
    Returns a dictionary matching the QuizOutput Pydantic schema.
    """

    # 1. Initialize the Pydantic parser
    parser = JsonOutputParser(pydantic_object=QuizOutput)

    # 2. Define the Prompt Template
    prompt_template = """
    # --- CACHE-BUSTING FIX ---
    # This is a unique number to force a new response: {random_number}
    # --------------------------
    You are an expert quizmaster and content analyst.
    Your task is to generate a comprehensive JSON object based on the provided Wikipedia article text.
    The JSON object must strictly adhere to the provided Pydantic schema.

    **Article Text:**
    ---
    {article_text}
    ---

    **Instructions:**
    1. **Analyze the Text:** Read the provided article text carefully.
    2. **Generate Data:** Extract the title, write a concise summary, and identify key entities.
    3. **Quiz Questions:** Generate 5-10 multiple-choice questions based on the content.
       - Include 4 options for each question.
       - Clearly mark the correct answer.
       - Provide a short explanation for the answer.
       - Assign a difficulty level (easy, medium, hard).
    4. **Key Entities:** Categorize important people, organizations, and locations mentioned.
    5. **Related Topics:** Suggest 3-5 related Wikipedia topics for further reading.

    **Output Format Instructions:**
    {format_instructions}

    **Final JSON Output:**
    """

    # 3. Initialize the Gemini Model
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file or environment")

    # --- FIX 1: Use Stable Model ---
    # 'gemini-flash-latest' points to 1.5 Flash, which has much higher rate limits
    # than the experimental 2.0 models.
    llm = ChatGoogleGenerativeAI(
        model="gemini-flash-latest",
        temperature=0.7,
        google_api_key=api_key,
        max_retries=3,  # --- FIX 2: Auto-Retry on 429 Errors ---
    )

    # 4. Create the LangChain Chain
    prompt = ChatPromptTemplate.from_template(
        template=prompt_template,
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    chain = prompt | llm | parser

    print("--- [LLM] Generating quiz data... ---")

    # 5. Invoke the Chain with a Manual Retry Loop (Extra Safety)
    max_attempts = 3
    for attempt in range(max_attempts):
        try:
            response_data = chain.invoke(
                {
                    "article_text": article_text,
                    "random_number": random.randint(10000, 99999),
                }
            )
            print("--- [LLM] Generation successful. ---")
            return response_data

        except Exception as e:
            # Check if it's a Rate Limit error (429)
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                wait_time = (attempt + 1) * 5  # Wait 5s, then 10s...
                print(
                    f"--- [LLM] Rate Limit Hit. Retrying in {wait_time}s... (Attempt {attempt+1}/{max_attempts}) ---"
                )
                time.sleep(wait_time)
            else:
                # If it's another error (like logic), fail immediately
                print(f"--- [LLM] Error during generation: {e} ---")
                raise

    raise Exception(
        "Failed to generate quiz after multiple retries due to Rate Limits."
    )
