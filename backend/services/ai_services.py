import os
import time
from services.chat_service import (
    save_message,
    get_recent_messages,
)
from services.chat_service import (
    save_message,
    get_recent_messages,
)

from services.session_service import (
    get_session,
)

from dotenv import load_dotenv
from google import genai
from google.genai.errors import ServerError
from services.retrieval_service import retrieve_relevant_chunks
from services.chat_memory import conversation_memory
from database.database import SessionLocal
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

Your task is to generate high-quality revision material for a university student.

Revision Style:
{revision_style}

==================================================
CONTENT RULES
==================================================

- Base the notes ONLY on the provided study material.
- Do not invent facts that are not supported by the study material.
- Explain concepts clearly and accurately.
- Keep the language student-friendly.
- Adapt the amount of detail to the requested revision style.
- Organize the notes using proper headings, subheadings and bullet points.
- Avoid unnecessary repetition.

==================================================
REVISION STYLE
==================================================

📄 Short Notes:
- Concise revision notes.
- Cover the important concepts without excessive explanation.
- Prefer definitions, key points, important operations and essential examples.
- Should be noticeably shorter than Detailed Notes.
- Do not omit important concepts merely to make the notes short.

📖 Detailed Notes:
- Explain the concepts thoroughly.
- Include definitions, working, important characteristics, examples and comparisons where present in the material.
- Explain concepts rather than merely listing them.
- Include important details that would help a student understand the topic properly.

🎯 Exam Focus:
- Focus on information most useful for university examinations.
- Emphasize definitions, important concepts, properties, differences, advantages/disadvantages, complexities, algorithms, likely exam points and important examples.
- Make the notes easy to revise before an exam.
- Avoid unnecessary background information.

🌙 Last-Minute Revision:
- Designed for very fast revision immediately before an exam.
- Include only the highest-value facts and concepts.
- Use short bullet points, keywords, formulas, complexities and quick comparisons.
- Prefer compact cheat-sheet style information.
- Avoid long explanations.

==================================================
MARKDOWN FORMATTING RULES
==================================================

- Return clean Markdown only.
- Use normal Markdown headings such as ## and ###.
- Use bullet points for lists.
- Use numbered lists when steps or sequences are important.
- Use Markdown tables ONLY when a comparison is genuinely useful.
- Do not create tables unnecessarily.

==================================================
STRICT TABLE RULES
==================================================

If you create a Markdown table, it MUST follow ALL of these rules:

1. Every row must begin with |.
2. Every row must end with |.
3. Every cell must be separated by |.
4. Every row must contain exactly the same number of columns.
5. There must be exactly ONE header row.
6. The row immediately after the header must be the Markdown separator row.
7. Never combine two cells into one cell.
8. Never omit a | separator.
9. Never allow normal explanatory text to continue inside a table row.
10. Keep table cells reasonably short.
11. If the comparison becomes too wide, use bullet points instead of a table.

Use this exact structure:

| Feature | Array | Linked List |
| --- | --- | --- |
| Memory | Contiguous | Non-contiguous |
| Access by index | O(1) | O(n) |
| Insert/Delete at front | O(n) | O(1) |
| Extra memory | None | Pointer(s) per node |

A row such as this is INVALID:

| Insert/Delete at known position O(n) shifting O(1) if node reference is known |

Never produce malformed rows like that.

==================================================
BIG-O FORMATTING
==================================================

Write Big-O notation ONLY as plain text:

O(1)
O(n)
O(log n)
O(n log n)

Do NOT:

- use LaTeX for Big-O notation
- use *O*(*n*)
- use **O(n)**
- use *O(n)*
- put Markdown emphasis characters around Big-O notation
- use Unicode mathematical formatting inside Big-O notation

Correct:

O(n)

Incorrect:

**O(n)**

Incorrect:

*O(n)*

Incorrect:

*O*(*n*)

==================================================
GENERAL MARKDOWN RULES
==================================================

- Do not output raw HTML.
- Do not wrap the entire response inside a code block.
- Do not output ```markdown.
- Do not repeat the same section or table.
- Keep Markdown simple and reliable for a web application.
- Do not use unnecessary decorative formatting.
- Keep headings meaningful.
- Keep tables readable.
- Use normal ASCII punctuation where possible.

==================================================
STUDY MATERIAL
==================================================

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
# PYQ EXAM PATTERN ANALYSIS
# ==========================================

def build_exam_pattern_prompt(pyq_text: str) -> str:

    return f"""
You are ExamPilot, an exam-preparation assistant for college students.

Analyze ONLY the previous-year question papers provided below.

Your job is to turn the PYQs into a QUICK, ACTIONABLE study guide.

The student should be able to look at the result and immediately understand:

1. What topics deserve the most attention?
2. Roughly how much of the PYQs does each topic cover?
3. Which types of questions should they practice?
4. What exact skill should they practice for each important topic?
5. What is the overall difficulty?

This is HISTORICAL ANALYSIS, NOT PREDICTION.

Never say that a topic or question is guaranteed to appear again.

Use ONLY evidence from the supplied PYQs.

Do not copy, recreate, or slightly modify questions from the PYQs.

----------------------------------------
WRITING STYLE
----------------------------------------

Use language suitable for a normal college student.

The result should feel:

- short
- clear
- useful
- direct
- practical

Avoid:

- academic jargon
- long explanations
- generic study advice
- repeated information
- vague statements

Every observation should normally be ONE short sentence.

Practice instructions must tell the student exactly what to do.

Good:
"Practice insertion and deletion questions."
"Practice tracing pointer changes."
"Revise Big-O for sorting algorithms."

Bad:
"Develop a comprehensive understanding of fundamental data structures."

----------------------------------------
JSON FORMAT
----------------------------------------

Return ONLY valid JSON.

Do NOT use Markdown.
Do NOT use ```json.
Do NOT write anything before or after the JSON.

Use EXACTLY this structure:

{{
    "overview": "2-3 short sentences describing the main exam pattern.",

    "total_questions": 0,

    "topics": [
    {{
        "topic": "Short topic name",
        "question_count": 0,
        "paper_count": 0,
        "papers_appeared": [],
        "weightage_percent": 0,
        "question_types": [],
        "priority": "High",
        "recency": "Recent",
        "observation": "One short sentence about how the topic appeared.",
        "practice_focus": "One direct thing the student should practice."
    }}
],

    "question_patterns": [
        {{
            "pattern": "Coding",
            "question_count": 0,
            "paper_count": 0,
            "weightage_percent": 0,
            "observation": "Short explanation of how this question type appeared.",
            "practice_focus": "Exact type of questions to practice."
        }}
    ],

    "difficulty_trends": [
        {{
            "level": "Moderate",
            "observation": "Short factual explanation."
        }}
    ],

    "year_trends": [
        {{
            "year": 2025,
            "topics": ["Linked Lists", "Stacks"],
            "observation": "Short factual observation."
        }}
    ],

    "preparation_guidance": [
        "Direct action the student should take."
    ],

    "warning": "Patterns can change in future exams. Use this analysis for preparation, not prediction."
}}

----------------------------------------
TOPIC ANALYSIS RULES
----------------------------------------

1. Identify only topics that are clearly tested by actual questions.

2. Group questions testing the same underlying concept.

3. Use short topic names.

Good:
"Linked Lists"
"Stacks"
"Binary Search"
"Pointers"
"Sorting"

Bad:
"Linear Linked List Structural Manipulation and Pointer Reassignment"

4. "total_questions" must be the number of distinct questions across ALL
   supplied papers.

5. "question_count" must be the number of DISTINCT questions that
   substantially test that topic.

6. "paper_count" must be the number of DIFFERENT papers containing that topic.

7. "papers_appeared" must contain the actual year or paper identifier
   available in the supplied data.

8. Do NOT count repeated mentions of a topic inside the same question
   multiple times.

9. Do NOT count a topic merely because it is mentioned.

10. A topic should count only when it is a meaningful part of the question.

----------------------------------------
WEIGHTAGE
----------------------------------------

11. Calculate topic weightage as:

    question_count / total_questions * 100

12. Round weightage to the nearest whole number.

13. This is QUESTION WEIGHTAGE only.

14. Do NOT call it marks weightage unless the supplied PYQs clearly contain
    reliable marks information.

15. If the total number of questions cannot be determined reliably,
    set "weightage_percent" to 0 instead of guessing.

16. Multiple topics may belong to the same question.

17. Therefore, topic weightages do NOT need to add up to 100%.

----------------------------------------
PRIORITY
----------------------------------------

18. Priority represents preparation priority based ONLY on historical
    evidence.

19. Use:

    High:
    - appears in multiple papers, OR
    - covers a substantial portion of questions.

    Medium:
    - appears meaningfully but less often.

    Low:
    - limited appearance.

20. Priority is NOT a prediction.

----------------------------------------
QUESTION TYPES
----------------------------------------

21. Identify the actual types of questions found in the papers.

Use simple categories such as:

- Theory
- Definition
- Coding
- Algorithm
- Numerical
- Output Tracing
- Complexity
- Problem Solving
- Comparison
- Application
- Design

22. "question_count" means the number of distinct questions of that type.

23. "paper_count" means the number of different papers containing that
    type.

24. Calculate "weightage_percent" as:

    question_count / total_questions * 100

25. Round to the nearest whole number.

26. Do NOT include a question type just because it is mentioned in a
    question.

27. Only include types supported by actual questions.

----------------------------------------
PRACTICE FOCUS
----------------------------------------

28. Every important topic MUST have a "practice_focus".

29. Practice focus must be something the student can directly do.

Examples:

"Practice linked-list insertion and deletion."

"Practice tracing pointer changes."

"Practice binary-search problems."

"Practice calculating Big-O."

"Practice output-tracing questions."

30. Question patterns must also have a practice focus.

Example:

Pattern:
"Output Tracing"

Practice:
"Practice predicting program output without running the code."

----------------------------------------
OBSERVATIONS
----------------------------------------

31. Keep observations factual.

Good:
"Appeared in 3 of 4 papers and was tested mainly through coding questions."

Bad:
"This is an extremely important topic that students should definitely
master."

32. Do not make predictions.

33. Do not use phrases such as:

"likely to appear"

"will appear"

"most expected"

"guaranteed"

"coming exam"

34. If there is only one paper, do not describe anything as a recurring
historical trend.
 RECENCY:

    Recency should be considered when assigning preparation priority.

    More recent papers should carry more weight than older papers when
    deciding how useful a topic is for current preparation.

    However, recency must NOT override frequency or question weightage.

    Use these labels:

    - "Recent" = topic appears in the most recent analyzed paper(s).
    - "Consistent" = topic appears in both older and recent papers.
    - "Older" = topic appears only in older papers.

 PRIORITY:

    Priority should consider:

    - question_count
    - paper_count
    - weightage_percent
    - recency

    A topic that appeared frequently in older papers but disappeared from
    the most recent paper should not automatically receive High priority.

    A topic appearing in the most recent paper should receive additional
    importance when the other evidence is similar.

    A topic appearing consistently across multiple years should generally
    receive strong preparation priority.

    A topic appearing only in an old paper should generally receive lower
    priority unless its question weightage is substantial.

    Do NOT claim that a recent topic is more likely to appear again.
    Recency is only a preparation signal.

----------------------------------------
DIFFICULTY
----------------------------------------

35. Judge difficulty only from the actual questions.

36. Use only:

- Easy
- Moderate
- Hard

37. If there is not enough evidence to judge difficulty, return:

[]

Do not guess.

----------------------------------------
YEAR ANALYSIS
----------------------------------------

38. Include only years or paper identifiers actually available.

39. Do not invent missing years.

40. Keep each year observation to ONE short sentence.

----------------------------------------
PREPARATION GUIDANCE
----------------------------------------

41. preparation_guidance must contain DIRECT ACTIONS.

Good:

"Revise linked-list operations and practice 5-10 problems."

"Practice output tracing without running the program."

"Revise Big-O and compare sorting algorithms."

Bad:

"Students should develop a strong conceptual foundation."

42. Give only the most useful preparation actions.

43. Avoid generic advice such as:

"Study regularly."

"Practice more."

"Understand the concepts."

----------------------------------------
FINAL QUALITY CHECK
----------------------------------------

Before returning JSON, check:

- Are all topics supported by actual questions?
- Are question counts based on distinct questions?
- Are paper counts based on different papers?
- Are weightages calculated from total questions?
- Are question types based on actual questions?
- Is every important topic actionable?
- Is the language simple?
- Is there unnecessary explanation?
- Is anything presented as a prediction?

The student should understand the complete analysis in under one minute.

PYQs:

{pyq_text}
"""
def analyze_exam_pattern(pyq_text: str):

    import json

    prompt = build_exam_pattern_prompt(pyq_text)

    response = _generate_with_retry(prompt)

    if response is None:
        return {
            "error": "Gemini is temporarily unavailable. Please try again in a minute."
        }

    response = response.strip()

    if response.startswith("```json"):
        response = response[len("```json"):].strip()

    elif response.startswith("```"):
        response = response[3:].strip()

    if response.endswith("```"):
        response = response[:-3].strip()

    try:
        return json.loads(response)

    except json.JSONDecodeError:

        print(
            "[PYQ ANALYSIS] Gemini returned invalid JSON."
        )

        print(
            "[PYQ ANALYSIS] Raw response:"
        )

        print(response)

        return {
            "error": "The AI returned an invalid analysis format."
        }

def build_practice_paper_prompt(pyq_text: str, question_count: int, difficulty: str) -> str:

    return f"""
You are ExamPilot, an exam-preparation assistant.

Create an ORIGINAL practice paper based ONLY on the previous-year
question papers provided below.

IMPORTANT:

- Do NOT copy any PYQ.
- Do NOT lightly rewrite or modify a PYQ.
- Create new questions that test the same underlying concepts,
  topics and question styles.
- Do NOT predict the next exam.
- Do NOT say that any question is guaranteed to appear.
- Keep the paper useful for actual exam preparation.

Difficulty: {difficulty}
Number of questions: {question_count}

Return ONLY valid JSON.
Do NOT use Markdown.
Do NOT wrap the JSON in a code block.
Do NOT write anything before or after the JSON.

Use EXACTLY this structure:

{{
    "title": "PYQ-Based Practice Paper",
    "instructions": [
        "Attempt all questions.",
        "Show your working where required."
    ],
    "questions": [
        {{
            "number": 1,
            "question": "Original question",
            "topic": "Topic",
            "type": "Numerical",
            "difficulty": "Moderate",
            "marks": 5,
            "solution": {{
                "steps": [
                    {{
                        "title": "Step 1 — Identify the given information",
                        "content": [
                            "Clearly state the values, conditions or concepts given in the question."
                        ]
                    }},
                    {{
                        "title": "Step 2 — Apply the required concept",
                        "content": [
                            "Show the relevant formula, rule, algorithm or reasoning.",
                            "Substitute values or explain the operation where necessary."
                        ]
                    }},
                    {{
                        "title": "Step 3 — Calculate or solve",
                        "content": [
                            "Show the important intermediate calculations or reasoning.",
                            "Do not skip directly to the final answer."
                        ]
                    }}
                ],
                "final_answer": "Clearly state the final answer."
            }}
        }}
    ]
}}

RULES:

1. Questions must be completely original.

2. Base the paper on patterns actually found in the supplied PYQs.

3. Cover important topics instead of repeatedly asking about one topic.

4. Use realistic college-exam question styles such as:
   - Theory
   - Definition
   - Coding
   - Algorithm
   - Numerical
   - Output Tracing
   - Complexity
   - Problem Solving
   - Comparison
   - Application

5. Match the requested difficulty.

6. Give every question:
   - number
   - question
   - topic
   - type
   - difficulty
   - marks
   - structured solution

7. Give every question a reasonable mark value.

8. Solutions must actually answer the question.

9. Solutions MUST be structured into logical steps.

10. Each solution step must have:
    - a short descriptive "title"
    - a "content" array containing one or more clear points

11. For numerical questions:
    - State the given values.
    - State the relevant formula.
    - Substitute values.
    - Show important calculations.
    - State the final result with units where appropriate.

12. For coding questions:
    - Explain the approach first.
    - Give the complete correct code.
    - Explain the important parts of the code.
    - Give the expected output when appropriate.
    - State time complexity when relevant.

13. For algorithm questions:
    - Explain the idea.
    - Give the steps or pseudocode.
    - Explain the result.
    - Give complexity when relevant.

14. For theory questions:
    - Give a direct definition or explanation.
    - Organize important points clearly.
    - Include examples when useful.

15. For comparison questions:
    - Clearly separate the compared concepts.
    - Use concise point-by-point comparisons.

16. NEVER put the entire solution into one huge paragraph.

17. NEVER use unnecessary filler such as:
    "Let's solve this problem."
    "First of all, we need to understand..."
    "Therefore, we can see that..."
    unless it is genuinely useful.

18. Keep mathematical calculations readable.

19. Use plain text for equations so the JSON remains valid.

20. Do not use Markdown formatting inside the JSON.

21. Do not invent topics that are not supported by the PYQs.

22. Generate exactly {question_count} questions.

Previous-Year Question Papers:

{pyq_text}
"""
def generate_practice_paper(
    pyq_text: str,
    question_count: int,
    difficulty: str,
):

    import json

    prompt = build_practice_paper_prompt(
        pyq_text,
        question_count,
        difficulty,
    )

    response = _generate_with_retry(prompt)

    if response is None:
        return {
            "error": "Gemini is temporarily unavailable. Please try again in a minute."
        }

    response = response.strip()

    if response.startswith("```json"):
        response = response[len("```json"):].strip()

    elif response.startswith("```"):
        response = response[3:].strip()

    if response.endswith("```"):
        response = response[:-3].strip()

    try:
        return json.loads(response)

    except json.JSONDecodeError:

        print("[PRACTICE PAPER] Gemini returned invalid JSON.")

        print("[PRACTICE PAPER] Raw response:")
        print(response)

        return {
            "error": "The AI returned an invalid practice paper format."
        }

def build_mock_test_prompt(
    pyq_text: str,
    pattern_analysis: str,
    question_count: int,
    difficulty: str,
) -> str:

    return f"""
You are ExamPilot, an expert university exam-preparation assistant.

Create an ORIGINAL multiple-choice mock test based ONLY on the
previous-year question papers provided below.

The purpose is to test the student's understanding of the same
important topics, concepts, patterns and question styles found in
the PYQs.

IMPORTANT:

- Do NOT copy any PYQ.
- Do NOT lightly rewrite or modify a PYQ.
- Create genuinely new questions.
- Do NOT predict the next examination.
- Do NOT claim that any question is guaranteed to appear.
- Do NOT introduce topics that are not supported by the PYQs.
- Questions must be suitable for a real university examination.
- Every question must have exactly 4 options.
- Exactly ONE option must be correct.
- The answer must be represented as a ZERO-BASED option index.
- The explanation must clearly explain why the correct answer is correct.
- Keep explanations concise but useful for a student reviewing mistakes.

Difficulty: {difficulty}

Number of questions: {question_count}

Return ONLY valid JSON.

Do NOT use Markdown.
Do NOT wrap the JSON inside a code block.
Do NOT write anything before or after the JSON.

Use EXACTLY this structure:

{{
    "title": "PYQ-Based Mock Test",
    "instructions": [
        "Attempt all questions.",
        "Choose the best answer for each question."
    ],
    "questions": [
        {{
            
            "number": 1,
            "topic": "Topic Name",
            "question": "Original MCQ question",
            "options": [
                "Option A",
                "Option B",
                "Option C",
                "Option D"
            ],
            "answer": 0,
            "explanation": "Brief explanation of why the correct option is correct."
        }}
    ]
}}

RULES:

1. Generate exactly {question_count} questions.

2. Every question must be original.

3. Base the questions on patterns actually found in the PYQs.

4. Cover important topics instead of repeatedly testing one topic.
4A. Use the Exam Pattern Analysis as the PRIMARY guide for topic selection.

4B. Questions should be distributed according to the importance and frequency of topics found in the analysis.

4C. Frequently occurring topics should appear more often than rare topics.

4D. If the analysis identifies high-priority units, ensure those units dominate the test.

5. Use realistic university-level MCQ styles such as:
   - Conceptual questions
   - Output tracing
   - Code understanding
   - Algorithm questions
   - Complexity
   - Numerical questions
   - Application questions
   - Comparison questions
   - Definitions where appropriate

6. Match the requested difficulty.

7. Every question must have exactly 4 options.

8. The "answer" field must contain only:
   0, 1, 2, or 3

9. The answer index must correspond exactly to the correct option.

10. Explanations must be factually correct and directly related
    to the question.

11. Do not put the correct answer inside the question text.

12. Do not use "All of the above" unless genuinely necessary.

13. Do not create ambiguous questions where multiple options
    could reasonably be correct.

14. Do not invent information that is not supported by the PYQs.
15. Every question MUST contain a "topic" field.

16. The topic must be a specific syllabus topic derived from the PYQs.

Examples:
- Binary Search Tree
- AVL Tree
- Linked List
- Deadlock
- Process Scheduling
- Normalization
- Hashing

Do NOT use vague topics like:
- General
- Theory
- Concepts
- Mixed
Exam Pattern Analysis:

{pattern_analysis}

Previous-Year Question Papers:

{pyq_text}
"""


def generate_mock_test(
    pyq_text: str,
    pattern_analysis: str,
    question_count: int,
    difficulty: str,
):

    import json

    prompt = build_mock_test_prompt(
    pyq_text,
    pattern_analysis,
    question_count,
    difficulty,
)

    response = _generate_with_retry(prompt)

    if response is None:
        return {
            "error": "Gemini is temporarily unavailable. Please try again in a minute."
        }

    response = response.strip()

    if response.startswith("```json"):
        response = response[len("```json"):].strip()

    elif response.startswith("```"):
        response = response[3:].strip()

    if response.endswith("```"):
        response = response[:-3].strip()

    try:
        return json.loads(response)

    except json.JSONDecodeError:

        print("[MOCK TEST] Gemini returned invalid JSON.")

        print("[MOCK TEST] Raw response:")
        print(response)

        return {
            "error": "The AI returned an invalid mock test format."
        }

def build_subjective_test_prompt(
    pyq_text: str,
    pattern_analysis: str,
    question_count: int,
    difficulty: str,
):
    return f"""
You are ExamPilot.

Create a university-style SUBJECTIVE mock test.

Use ONLY:
- Previous Year Questions
- Exam Pattern Analysis

Difficulty: {difficulty}

Number of questions: {question_count}

Return ONLY valid JSON.

Structure:

{{
    "title": "PYQ-Based Subjective Test",
    "questions": [
        {{
            "number": 1,
            "topic": "AVL Tree",
            "marks": 10,
            "question": "Explain AVL rotations with suitable examples."
        }}
    ]
}}

RULES:

1. Generate exactly {question_count} questions.
2. Questions must be original.
3. Follow the exam pattern analysis.
4. Mix 2, 5 and 10 mark questions.
5. Use important and recurring topics.
6. No MCQs.
7. No answers.
8. No explanations.

Exam Pattern Analysis:

{pattern_analysis}

Previous Year Questions:

{pyq_text}
"""
def generate_subjective_test(
    pyq_text: str,
    pattern_analysis: str,
    question_count: int,
    difficulty: str,
):
    import json

    prompt = build_subjective_test_prompt(
        pyq_text,
        pattern_analysis,
        question_count,
        difficulty,
    )

    response = _generate_with_retry(prompt)

    if response is None:
        return {
            "error": "Gemini unavailable"
        }

    response = response.strip()

    if response.startswith("```json"):
        response = response[len("```json"):].strip()

    elif response.startswith("```"):
        response = response[3:].strip()

    if response.endswith("```"):
        response = response[:-3].strip()

    try:
        return json.loads(response)

    except json.JSONDecodeError:

        print(response)

        return {
            "error": "Invalid JSON returned"
        }

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

from services.retrieval_service import retrieve_relevant_chunks
def update_session_title(session_id: int, question: str):

    db = SessionLocal()

    try:

        session = get_session(session_id)

        if session is None:
            return

        if session.title != "New Chat":
            return

        title = question.strip()

        if len(title) > 40:
            title = title[:40] + "..."

        session.title = title

        db.merge(session)
        db.commit()

    finally:

        db.close()


def ask_ai(
    session_id: int,
    question: str,
):
    session = get_session(session_id)

    if session is None:
        return "Invalid chat session."

    document_id = session.document_id

    from services.retrieval_service import retrieve_relevant_chunks
    from services.chat_service import (
        get_recent_messages,
        save_message,
    )

    # -------------------------------
    # Get previous conversation
    # -------------------------------

    messages = get_recent_messages(
        session_id=session_id,
        limit=10,
    )

    previous_context = ""

    for msg in messages:

        if msg.role == "user":

            previous_context += (
                f"Student:\n{msg.message}\n\n"
            )

        else:

            previous_context += (
                f"Your Answer:\n{msg.message}\n\n"
            )

    # -------------------------------
    # Retrieve relevant chunks
    # -------------------------------

    results = retrieve_relevant_chunks(
        question=question,
        document_id=document_id,
    )

    chunks = results["documents"][0]

    context = ""

    if len(chunks) > 0:

        context = "\n\n".join(chunks)

    # -------------------------------
    # Prompt
    # -------------------------------

    prompt = f"""
You are ExamPilot AI Tutor.

Your goal is to help the student understand and learn,
not merely to repeat the uploaded study material.

You have three possible sources of information:

1. Uploaded Study Material
2. Conversation History
3. Your General Knowledge

SOURCE PRIORITY:

The uploaded study material should be your PRIMARY source
whenever the student's question is related to that material.

However, you are NOT restricted to the uploaded material.

You may use your general knowledge when it helps the student:
- understand a concept more clearly
- simplify something from the document
- provide additional examples
- provide real-world applications
- answer a related question not covered in the document
- connect the document's concepts to broader knowledge
- fill a genuine gap in the study material

IMPORTANT:

Do NOT pretend that general knowledge came from the uploaded
study material.

When useful, make the distinction clear naturally, for example:

"Your notes explain X. To give you some additional context,
another real-world use is Y."

Do not unnecessarily mention this distinction for every answer.

CONVERSATION HISTORY:

{previous_context}

RELEVANT UPLOADED STUDY MATERIAL:

{context}

CURRENT STUDENT QUESTION:

{question}

BEHAVIOR RULES:

1. If the question is directly about something covered in the
   uploaded material, use that material as the foundation of
   your answer.

2. If the student asks for an explanation of something from
   the material, explain it in your own words when necessary.
   Do not simply repeat the document.

3. If the student asks for more examples, applications,
   intuition, comparisons, or real-world uses, you may provide
   additional information from your general knowledge.

4. If the question is related to the document but goes beyond
   what the document covers, answer using the document first
   and then supplement it with appropriate general knowledge.

5. If the question is unrelated to the uploaded material,
   you may answer using your general knowledge.

6. Use conversation history to understand follow-up questions.
   Do NOT require the student to use specific phrases such as
   "explain more", "elaborate", or "continue".

7. If the student asks something ambiguous, use the conversation
   history and available study material to determine what they
   most likely mean.

8. Never fabricate information or claim that something is in
   the uploaded material when it is not.

9. If information from the uploaded material conflicts with
   established general knowledge, clearly distinguish the
   document's statement from the broader explanation rather than
   silently changing the document's content.

10. Answer like a helpful university tutor: clear, accurate,
    student-friendly, and appropriately detailed.

Do not unnecessarily refuse to answer merely because the
uploaded material does not contain the answer.
"""

    response = _generate_with_retry(prompt)

    if response is None:

        return (
            "⚠️ Gemini is temporarily unavailable.\n"
            "Please try again."
        )

    # -------------------------------
    # Save conversation
    # -------------------------------

    save_message(
        session_id=session_id,
        role="user",
        message=question,
    )

    update_session_title(
        session_id=session_id,
        question=question,
    )

    save_message(
        session_id=session_id,
        role="assistant",
        message=response,
    )

    return response