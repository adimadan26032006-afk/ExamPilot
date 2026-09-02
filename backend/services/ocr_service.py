import pytesseract
from pdf2image import convert_from_path
from PIL import ImageOps

# Path to Tesseract
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Users\adima\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"
)

# Path to Poppler
POPPLER_PATH = (
    r"C:\Users\adima\Downloads\Release-26.02.0-0\poppler-26.02.0\Library\bin"
)


def extract_text_with_ocr(pdf_path):

    pages = convert_from_path(
        pdf_path,
        poppler_path=POPPLER_PATH,
        dpi=300,
    )

    full_text = ""

    for page in pages:

        # Convert to grayscale
        page = ImageOps.grayscale(page)

        # Automatically improve contrast
        page = ImageOps.autocontrast(page)

        text = pytesseract.image_to_string(
            page,
            lang="eng",
            config="--oem 3 --psm 3"
        )

        print("=" * 50)
        print("OCR PAGE")
        print("Characters:", len(text))
        print(text[:300])
        print("=" * 50)

        full_text += text + "\n"

    return full_text