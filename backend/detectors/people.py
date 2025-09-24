import os
import cv2
from ultralytics import YOLO

# Load YOLO once (efficient)
model_path = os.path.join(os.path.dirname(__file__), 'models', 'yolov8n.pt')
model = YOLO(model_path)

def detect_people(image_path):
    """Detect people in the given image using YOLOv8."""
    target_class = "person"

    image = cv2.imread(image_path)
    if image is None:
        return {"category": "people", "detections": [], "error": f"Image {image_path} not found."}

    results = model(image)
    detected_items = []

    for result in results:
        for box in result.boxes:
            cls_id = int(box.cls[0])
            label = result.names[cls_id]
            if label == target_class:
                x1, y1, x2, y2 = map(int, box.xyxy[0])

                detected_items.append({
                    "label": label,
                    "confidence": round(float(box.conf[0]), 2),
                    "bbox": [x1, y1, x2, y2]
                })

    return {
        "category": "people",
        "detections": detected_items
    }
