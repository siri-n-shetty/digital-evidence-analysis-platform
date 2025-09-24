import os
from ultralytics import YOLO

def detect_technology(image_path):
    """Detect technology-related items in the given image."""
    # Load YOLOv8 model (ensure the model is trained for technology items)
    model_path = os.path.join(os.path.dirname(__file__), 'models', 'yolov8n.pt')
    model = YOLO(model_path)

    # Perform detection
    results = model(image_path)

    # Define the specific technology items to detect
    target_items = {"tv", "laptop", "mouse", "remote", "keyboard", "cell phone"}

    # Extract detected items and their confidence scores, filtering for target items
    detected_items = []
    for result in results[0].boxes.data.tolist():
        x1, y1, x2, y2, confidence, class_id = result
        label = model.names[int(class_id)]
        if label in target_items:
            detected_items.append({
                "label": label,
                "confidence": round(confidence, 2),
                "bbox": [x1, y1, x2, y2]
            })

    return {
        "category": "technology",
        "detections": detected_items
    }