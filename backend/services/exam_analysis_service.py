
import json

from services.ai_services import _generate_with_retry



def build_exam_analysis_prompt(papers):
    print("NEW EXAM ANALYSIS PROMPT IS RUNNING")
    papers_text = ""

    for paper in papers:
        papers_text += f"""
==============================
YEAR: {paper["year"]}
DOCUMENT: {paper["filename"]}
==============================

{paper["text"]}

"""

    return f"""
You are ExamPilot's exam pattern analysis engine.

Analyze the previous-year question papers provided below.

Your analysis is for a normal college student preparing for an exam.

The goal is to make the analysis:
- Simple
- Short
- Clear
- Useful for revision
- Easy to understand at a glance

Do NOT predict the next exam.

Do NOT say that a topic is guaranteed to appear.

Only identify patterns that are actually supported by the supplied papers.

Do NOT copy, recreate, or slightly modify questions from the papers.

Identify the important topics, question types, skills, and recurring patterns
that can help the student prepare.

IMPORTANT WRITING RULES:

1. Use simple student-friendly language.

2. Avoid complicated academic words when a simpler word can be used.

3. Keep every observation to ONE short sentence.

4. Keep topic names short and recognizable.
   Example:
   "Linked Lists"
   NOT
   "Linear Linked List Structural Manipulation and Pointer Reassignment"

5. Do not explain basic concepts unless necessary.

6. Focus on WHAT appeared and WHAT the student should prepare.

7. If only one paper is available, clearly treat it as a single-paper analysis.
   Do not pretend that a historical trend exists.

8. Do not invent information that is not present in the papers.

9. If evidence is weak or unavailable, use an empty list rather than guessing.

10. Keep the overall analysis concise.

Return ONLY valid JSON.

Do not use Markdown.
Do not wrap the JSON in a code block.

Required JSON structure:

{{
    "topics": [
        {{
            "name": "Short topic name",
            "question_count": 0,
            "papers_appeared": 0,
            "priority": "High"
        }}
    ],

    "question_types": [
        {{
            "type": "Algorithm",
            "count": 0
        }}
    ],

    "yearly_trends": [
        {{
            "year": "2025",
            "topics": {{
                "Short topic name": 0
            }}
        }}
    ],

    "recurring_topics": [
        "Topic 1",
        "Topic 2"
    ],

    "skill_patterns": [
        {{
            "skill": "Tracing",
            "topics": [
                "Topic 1"
            ],
            "frequency": 0
        }}
    ],

    "observations": [
        "Short factual observation."
    ]
}}

RULES FOR ANALYSIS:

1. Count topics only from questions actually present.

2. "question_count" means how many questions substantially involve that topic.

3. "papers_appeared" means the number of different papers containing that topic.

4. Use simple question types such as:
   - Theory
   - Definition
   - Coding
   - Algorithm
   - Complexity
   - Numerical
   - Output Tracing
   - Application
   - Comparison
   - Problem Solving

5. Identify useful student skills such as:
   - Coding
   - Tracing
   - Problem Solving
   - Mathematical Derivation
   - Complexity Analysis
   - Pointer Manipulation
   - Algorithm Design

6. "priority" means how important the topic is for preparation based ONLY
   on the supplied papers.

7. Use:
   - "High" for topics that appear often or form a major part of the paper.
   - "Medium" for topics with noticeable importance.
   - "Low" for topics with limited appearance.

8. Do not treat priority as a prediction.

9. "recurring_topics" should contain ONLY topics that appear in more than
   one paper.

10. If there is only one paper, "recurring_topics" should normally be empty.

11. "yearly_trends" should only contain years actually present in the papers.

12. Keep observations short.
    Example:
    "Questions mainly tested pointer manipulation and in-place operations."

13. Do not write long explanations such as essays.

14. The final result should help a student answer:
    "What should I study?"
    "What type of questions should I practice?"
    "What skills does this exam test?"

SELECTED QUESTION PAPERS:

{papers_text}
"""

def analyze_exam_pattern(papers):

    prompt = build_exam_analysis_prompt(papers)

    response = _generate_with_retry(prompt)

    if response is None:
        return None

    try:
        return json.loads(response)

    except json.JSONDecodeError:

        print("[EXAM ANALYSIS] Gemini returned invalid JSON.")

        return None