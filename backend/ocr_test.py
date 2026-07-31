from pdf2image import convert_from_path
import pytesseract
import os

# Path to Tesseract
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Users\adima\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"
)

# Absolute path to your PDF
pdf_path = os.path.abspath(
    "uploads/MA24103 Maths-II Tutorial 3 SP26.pdf"
)

# Correct Poppler path
poppler_path = (
    r"C:\Users\adima\Downloads\Release-26.02.0-0"
    r"\poppler-26.02.0\Library\bin"
)

# Verify paths
print("PDF exists:", os.path.exists(pdf_path))
print("Poppler exists:", os.path.exists(os.path.join(poppler_path, "pdfinfo.exe")))

# Convert PDF pages into images
pages = convert_from_path(
    pdf_path,
    poppler_path=poppler_path
)

print(f"Total pages: {len(pages)}")

# OCR first page
text = pytesseract.image_to_string(pages[0])

print("\n===== OCR OUTPUT =====\n")
print(text[:3000])
import os

print("Tesseract exists:", os.path.exists(pytesseract.pytesseract.tesseract_cmd))
print("Using:", pytesseract.pytesseract.tesseract_cmd)