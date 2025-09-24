import cv2
from ultralytics import YOLO
import easyocr
import os

def detect_vehicles(image_path):
    # Initialize YOLOv8 and PaddleOCR
    model = YOLO('yolov8n.pt')  # lightweight model, good for CPU
    reader = easyocr.Reader(['en'])

    vehicle_classes = ['bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light']
    image = cv2.imread(image_path)
    if image is None:
        return {"error": f"Image {image_path} not found."}

    results = model(image)
    detected = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            cls_id = int(box.cls[0])
            cls_name = result.names[cls_id]
            if cls_name in vehicle_classes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                cropped_vehicle = image[y1:y2, x1:x2]
                ocr_result = reader.readtext(cropped_vehicle)
                plate_texts = [text for _, text, _ in ocr_result]
                detected.append({
                    "class": cls_name,
                    "box": [x1, y1, x2, y2],
                    "plates": plate_texts
                })
    return {"vehicles": detected}
