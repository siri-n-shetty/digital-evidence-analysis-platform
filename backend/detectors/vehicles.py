import os
import cv2
from ultralytics import YOLO
import easyocr

# Load YOLO and OCR once (efficient)
model_path = os.path.join(os.path.dirname(__file__), 'models', 'yolov8n.pt')
model = YOLO(model_path)
reader = easyocr.Reader(['en'])

def detect_vehicles(image_path):
    """Detect vehicles and license plates in the given image."""
    vehicle_classes = {
        "bicycle", "car", "motorcycle", "bus", "train", "truck", "boat"
    }

    image = cv2.imread(image_path)
    if image is None:
        return {"category": "vehicles", "detections": [], "error": f"Image {image_path} not found."}

    results = model(image)
    detected_items = []

    for result in results:
        for box in result.boxes:
            cls_id = int(box.cls[0])
            label = result.names[cls_id]
            if label in vehicle_classes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cropped_vehicle = image[y1:y2, x1:x2]
                if cropped_vehicle.size == 0:
                    continue

                # Run OCR on the cropped vehicle region
                ocr_result = reader.readtext(cropped_vehicle)
                plates = [text for _, text, _ in ocr_result]

                detected_items.append({
                    "label": label,
                    "confidence": round(float(box.conf[0]), 2),
                    "bbox": [x1, y1, x2, y2],
                    "plates": plates
                })

    return {
        "category": "vehicles",
        "detections": detected_items
    }
