import os
from ultralytics import YOLO

def detect_technology(image_path):
    """Detect technology-related items in the given image."""
    # Load YOLOv8 model (ensure the model is trained for technology items)
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'yolov8n.pt')
    model = YOLO(model_path)

    # Perform detection
    results = model(image_path)

    # Extract detected items and their confidence scores
    detected_items = []
    for result in results[0].boxes.data.tolist():
        x1, y1, x2, y2, confidence, class_id = result
        detected_items.append({
            "label": model.names[int(class_id)],
            "confidence": round(confidence, 2),
            "bbox": [x1, y1, x2, y2]
        })

    return {
        "category": "technology",
        "detections": detected_items
    }