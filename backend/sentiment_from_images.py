import cv2
import easyocr
from transformers import pipeline
from PIL import Image
import numpy as np
import os

# For PDF and DOCX support
import pdfplumber
from docx import Document

reader = easyocr.Reader(['en'])
classifier = pipeline('sentiment-analysis')

danger_words = ["kill", "death", "murder", "suicide", "die", "dead", "hurt", "pain"]
threshold = 0.65

def load_image(image_path):
    ext = os.path.splitext(image_path)[1].lower()
    if ext == '.gif':
        with Image.open(image_path) as im:
            im = im.convert('RGB')
            frame = np.array(im)
            img = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
    else:
        img = cv2.imread(image_path)
    return img

def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    print(f"[DEBUG] Extracting text from file: {file_path}, extension: {ext}")
    text = ""
    if ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.gif']:
        img = load_image(file_path)
        result_easyocr = reader.readtext(img, detail=0)
        text = ' '.join(result_easyocr)
    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    elif ext == ".pdf":
        with pdfplumber.open(file_path) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    elif ext == ".docx":
        doc = Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
    else:
        print(f"[WARN] Unsupported file extension: {ext}")
        text = ""
    print(f"[DEBUG] Extracted text: {text[:100]}...")
    return text

def detect_content(file_path):
    print(f"[DEBUG] Running detect_content for file: {file_path}")
    text = extract_text(file_path)
    result = classifier(text)
    print(f"[DEBUG] Sentiment result: {result}")
    found = [word for word in danger_words if word.lower() in text.lower()]
    print(f"[DEBUG] Danger words found: {found}")
    highlighted = text
    if result[0]['label'] == 'NEGATIVE' and result[0]['score'] > threshold and found:
        for word in found:
            highlighted = highlighted.replace(word, word.upper())
    print(f"[DEBUG] Highlighted text: {highlighted[:100]}...")
    return {
        "detected_text": text,
        "sentiment": result[0],
        "danger_words": found,
        "highlighted_text": highlighted
    }