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

    # 2. Define the Prompt Template (Optimized for Tokens)
    prompt_template = """
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
    """

    # 3. Initialize the Gemini Model
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in .env file or environment")

    llm = ChatGoogleGenerativeAI(
        model="gemini-flash-latest",
        temperature=0.7,
        google_api_key=api_key,
        max_retries=2,
    )

    # 4. Create the LangChain Chain
    prompt = ChatPromptTemplate.from_template(
        template=prompt_template,
        partial_variables={"format_instructions": parser.get_format_instructions()},
    )

    chain = prompt | llm | parser

    print("--- [LLM] Generating quiz data... ---")

    # 5. Invoke the Chain with a Manual Retry Loop
    max_attempts = 3
    for attempt in range(max_attempts):
        try:
            # We don't inject random_number into the prompt text to save tokens,
            # but we can pass it if we want to ensure variety in the call signature.
            # For pure token savings, simpler is better.
            response_data = chain.invoke(
                {
                    "article_text": article_text,
                }
            )
            print("--- [LLM] Generation successful. ---")
            return response_data

        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                wait_time = (attempt + 1) * 5
                print(
                    f"--- [LLM] Rate Limit Hit. Retrying in {wait_time}s... (Attempt {attempt+1}/{max_attempts}) ---"
                )
                time.sleep(wait_time)
            else:
                print(f"--- [LLM] Error during generation: {e} ---")
                raise

    raise Exception(
        "Failed to generate quiz after multiple retries due to Rate Limits."
    )
