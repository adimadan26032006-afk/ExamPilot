import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

pdf = client.files.upload(
    file="uploads/MA24103 Maths-II Tutorial 3 SP26.pdf"
)

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        """
Explain Question 10 from this PDF exactly as written.

Preserve every mathematical equation,
every symbol,
every fraction,
and every derivative.

Do NOT simplify notation.
""",
        pdf
    ]
)

print(response.text)