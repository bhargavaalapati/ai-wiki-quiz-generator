import os
import random
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from models import QuizOutput

# Load API key from .env
load_dotenv()
# We'll check for the key's existence inside the function
# just before we use it.


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
    # ... (all your instructions: Analyze, Generate, Quiz, Entities, etc.) ...
    6.  **Flashcards:** Generate 5-10 high-quality flashcards...

    **Output Format Instructions:**
    {format_instructions}
    
    **Final JSON Output:**
    """

    # 3. Initialize the Gemini Model (MAKE SURE IT'S gemini-pro-latest)
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file or environment")

    llm = ChatGoogleGenerativeAI(
        model="gemini-pro-latest",  # <-- Double-check this is correct
        temperature=0.7,
        google_api_key=api_key,
    )

    # 4. Create the LangChain Chain
    prompt = ChatPromptTemplate.from_template(
        template=prompt_template,
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    chain = prompt | llm | parser

    print("--- [LLM] Generating quiz data... ---")

    # 5. Invoke the Chain
    try:
        # --- CACHE-BUSTING FIX ---
        # Add the random number and article text to the invoke call
        response_data = chain.invoke(
            {
                "article_text": article_text,
                "random_number": random.randint(10000, 99999),  # <-- ADD THIS
            }
        )
        # --------------------------

        print("--- [LLM] Generation successful. ---")
        return response_data
    except Exception as e:
        print(f"--- [LLM] Error during generation: {e} ---")
        raise
