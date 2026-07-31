import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai.errors import ServerError

# ==========================================
# Environment
# ==========================================

load_dotenv()

MODEL_NAME = "gemini-3.5-flash"

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# ==========================================
# Quiz Configuration
# ==========================================

QUIZ_LENGTH = {
    "Quick Quiz": 5,
    "Standard Quiz": 10,
    "Full Mock Test": 20,
}

DIFFICULTY_GUIDELINES = {
    "Easy": """
- Mostly direct recall questions.
- Definition-based.
- Very straightforward.
- Minimal conceptual traps.
""",

    "Medium": """
- Application-based.
- Mix of factual and conceptual.
- Moderate difficulty.
- Similar to regular university exams.
""",

    "Hard": """
- Higher-order thinking.
- Multi-concept questions.
- Tricky distractors.
- Similar to difficult university exams.
""",
}

# ==========================================
# Shared Gemini Request Function
# ==========================================

def _generate_with_retry(prompt: str):

    retries = 5

    for attempt in range(retries):

        try:

            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
            )

            return response.text

        except ServerError as e:

            if "503" in str(e):

                wait = 2 ** attempt

                print(
                    f"Gemini busy. Retrying in {wait} seconds..."
                )

                time.sleep(wait)

                continue

            raise e

    return None
# ==========================================
# Prompt Builders
# ==========================================

def build_summary_prompt(
    text: str,
    revision_style: str,
) -> str:

    return f"""
You are ExamPilot, an expert university study assistant.

Your task is to generate high-quality revision material.

Revision Style:
{revision_style}

Rules:

- Explain concepts clearly.
- Keep the language student-friendly.
- Do not invent facts.
- Base everything ONLY on the provided study material.
- Organize using proper headings and bullet points whenever appropriate.

Study Material:

{text}
"""


def build_quiz_prompt(
    text: str,
    quiz_type: str,
    difficulty: str,
) -> str:

    number_of_questions = QUIZ_LENGTH.get(
        quiz_type,
        10,
    )

    difficulty_rules = DIFFICULTY_GUIDELINES.get(
        difficulty,
        DIFFICULTY_GUIDELINES["Medium"],
    )

    return f"""
You are an expert university exam setter.

Generate EXACTLY {number_of_questions} multiple choice questions.

Difficulty Level:

{difficulty}

Difficulty Guidelines:

{difficulty_rules}

Quiz Type:

{quiz_type}

Rules:

- Return ONLY valid JSON.
- DO NOT use markdown.
- DO NOT wrap JSON inside ```json.
- DO NOT write any explanation before or after JSON.

JSON format:

[
  {{
    "question": "...",
    "options": [
      "...",
      "...",
      "...",
      "..."
    ],
    "answer": 0,
    "explanation": "..."
  }}
]

Requirements:

- Exactly {number_of_questions} questions.
- Exactly FOUR options.
- Only ONE correct answer.
- "answer" must be 0,1,2 or 3.
- Explanation should be one short sentence.
- Questions should resemble university examination questions.
- Base every question ONLY on the study material below.

Study Material:

{text}
"""

# ==========================================
# Summary Generation
# ==========================================

def generate_summary(
    text: str,
    revision_style: str,
):

    prompt = build_summary_prompt(
        text,
        revision_style,
    )

    response = _generate_with_retry(prompt)

    if response is None:

        return """
# ⚠️ AI Temporarily Busy

Gemini is currently experiencing high demand.

Please wait a minute and try generating the notes again.

Your uploaded document is safe.
"""

    return response
# ==========================================
# Quiz Generation
# ==========================================

def generate_quiz(
    text: str,
    quiz_type: str,
    difficulty: str,
):

    prompt = build_quiz_prompt(
        text=text,
        quiz_type=quiz_type,
        difficulty=difficulty,
    )

    response = _generate_with_retry(prompt)

    # Gemini unavailable after all retries
    if response is None:

        return """
[
    {
        "question":"Gemini is temporarily unavailable.",
        "options":[
            "Please try again in a minute.",
            "",
            "",
            ""
        ],
        "answer":0,
        "explanation":"Temporary server overload."
    }
]
"""

    # ---------------------------------------
    # Gemini sometimes returns markdown
    # Remove it automatically.
    # ---------------------------------------

    response = response.strip()

    if response.startswith("```json"):
        response = response.replace("```json", "", 1)

    if response.startswith("```"):
        response = response.replace("```", "", 1)

    if response.endswith("```"):
        response = response[:-3]

    response = response.strip()

    return response
def build_flashcard_prompt(text: str) -> str:

    return f"""
You are an expert university professor.

Generate EXACTLY 20 flashcards.

Return ONLY valid JSON.

Do NOT use markdown.

Do NOT wrap JSON inside ```json.

JSON format:

[
  {{
    "question":"...",
    "answer":"...",
    "explanation":"..."
  }}
]

Rules:

- Question should test understanding.
- Answer should be concise.
- Explanation should be 1-3 short sentences.
- Base everything ONLY on the study material.
- Generate exactly 20 flashcards.

Study Material:

{text}
"""
# ==========================================
# Flashcard Generation
# ==========================================

def generate_flashcards(text: str):

    prompt = build_flashcard_prompt(text)

    response = _generate_with_retry(prompt)

    if response is None:

        return """
[
    {
        "question":"Gemini is temporarily unavailable.",
        "answer":"Please try again in a minute.",
        "explanation":"Temporary server overload."
    }
]
"""

    response = response.strip()

    if response.startswith("```json"):
        response = response.replace("```json", "", 1)

    if response.startswith("```"):
        response = response.replace("```", "", 1)

    if response.endswith("```"):
        response = response[:-3]

    response = response.strip()

    return response


# ==========================================
# AI Tutor
# ==========================================

def ask_ai(
    text: str,
    question: str,
):

    prompt = f"""
You are an expert university professor.

Use ONLY the study material below to answer the student's question.

Rules:

- Explain clearly.
- Keep answers concise.
- If the answer is not contained in the study material,
  honestly say that it is not present.
- Never invent facts.

Study Material:

{text}

Student Question:

{question}
"""

    response = _generate_with_retry(prompt)

    if response is None:

        return (
            "⚠️ Gemini is temporarily unavailable.\n"
            "Please try again in a minute."
        )

    return response