import os
import cv2
from ultralytics import YOLO

# Load YOLO model once (replace with your custom weapons model if available)
model_path = r'D:\Semester7\CID\final-workflow\backend\best.pt'
model = YOLO(model_path)

def detect_weapons(image_path):
    """Detect weapons (guns, knives, etc.) in the given image."""

    # NOTE: Default COCO model only has 'knife'. 
    weapon_classes = {"knife"}  

    image = cv2.imread(image_path)
    if image is None:
        return {"category": "weapons", "detections": [], "error": f"Image {image_path} not found."}

    results = model(image)
    detections = []

    for result in results:
        for box in result.boxes:
            cls_id = int(box.cls[0])
            label = result.names[cls_id]
            if label in weapon_classes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                confidence = round(float(box.conf[0]), 2)
                detections.append({
                    "label": label,
                    "confidence": confidence,
                    "bbox": [x1, y1, x2, y2]
                })

    return {
        "category": "weapons",
        "detections": detections
    }
