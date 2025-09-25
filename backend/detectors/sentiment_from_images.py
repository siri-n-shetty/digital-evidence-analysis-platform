import os
import cv2
import numpy as np
from PIL import Image
import easyocr
from transformers import pipeline
import pdfplumber
from docx import Document

# Initialize models
suicide_pipe = pipeline("text-classification", model="sentinet/suicidality")
ocr_reader = easyocr.Reader(['en'])

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
    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    elif ext == ".docx":
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    elif ext == ".pdf":
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += (page.extract_text() or "") + "\n"
        return text
    elif ext in [".png", ".jpg", ".jpeg", ".gif", ".webp", ".tiff"]:
        img = load_image(file_path)
        result = ocr_reader.readtext(img, detail=0)
        return " ".join(result)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

def is_meaningful_text(text):
    if not text or len(text.strip()) < 5:
        return False
    words = text.strip().split()
    letters = sum(c.isalpha() for c in text)
    if len(words) < 2 or letters < 3:
        return False
    return True

def detect_text_content(text):
    result = suicide_pipe(text, truncation=True)[0]
    raw_label = result["label"]
    score = float(result["score"])
    found = [word for word in danger_words if word.lower() in text.lower()]

    # Map raw labels to human-readable labels
    label_map = {
        "LABEL_0": "non-suicidal",
        "LABEL_1": "suicidal"
    }
    label = label_map.get(raw_label, raw_label)

    # Highlight danger words if the label is "suicidal"
    highlighted = text
    if label == "suicidal" and found:
        for word in found:
            highlighted = highlighted.replace(word, word.upper())

    # Return the result with proper interpretation of label and score
    return {
        "detected_text": text,
        "suicidal_label": label,
        "suicidal_score": round(score, 4),
        "flag": (label == "suicidal" and score > threshold),
        "danger_words": found,
        "highlighted_text": highlighted
    }

def detect_content(file_path, original_filename=None):
    filename = original_filename if original_filename else os.path.basename(file_path)
    text = extract_text(file_path)
    
    print(f"[DEBUG] File: {filename}")
    print(f"[DEBUG] Extracted text (first 100 chars): {text[:100]}...")
    
    if not is_meaningful_text(text):
        print("[DEBUG] Text too short or gibberish, defaulting to non-suicidal")
        return {
            "filename": filename,
            "detected_text": text,
            "suicidal_label": "non-suicidal",
            "suicidal_score": 0.0,
            "flag": False,
            "danger_words": [],
            "highlighted_text": text
        }
    
    result = detect_text_content(text)
    result["filename"] = filename
    return result

# def detect_content(file_path, original_filename=None):
    filename = original_filename if original_filename else os.path.basename(file_path)
    text = extract_text(file_path)
    
    print(f"[DEBUG] File: {filename}")
    print(f"[DEBUG] Extracted text (first 100 chars): {text[:100]}...")
    
    if not is_meaningful_text(text):
        print("[DEBUG] Text too short or gibberish, defaulting to non-suicidal")
        return {
            "filename": filename,
            "category": "content",           # ✅ add this
            "result": {
                "detected_text": text,
                "suicidal_label": "non-suicidal",
                "suicidal_score": 0.0,
                "flag": False,
                "danger_words": [],
                "highlighted_text": text
            }
        }
    
    result = detect_text_content(text)
    return {
        "filename": filename,
        "category": "content",            # ✅ add this
        "result": result
    }
