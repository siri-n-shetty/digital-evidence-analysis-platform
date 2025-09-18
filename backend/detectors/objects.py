# from google.cloud import vision
# import io

# def analyze_image(image_path):
#     client = vision.ImageAnnotatorClient()

#     with io.open(image_path, 'rb') as image_file:
#         content = image_file.read()

#     image = vision.Image(content=content)

#     # Object detection
#     objects = client.object_localization(image=image).localized_object_annotations
#     print("Objects detected:")
#     for obj in objects:
#         print(f"{obj.name} (confidence: {obj.score:.2f})")

#     # Label detection (broad categories)
#     labels = client.label_detection(image=image).label_annotations
#     print("\nLabels:")
#     for label in labels:
#         print(f"{label.description} (score: {label.score:.2f})")

#     # Text detection (credit card numbers, invoices, IDs, etc.)
#     text = client.text_detection(image=image).text_annotations
#     if text:
#         print("\nDetected text:")
#         print(text[0].description)

# # Example usage
# # analyze_image("bill.png")
# analyze_image(r"D:\Semester7\CID\input\bill.png")

import cv2
from ultralytics import YOLO

def detect_assets(image_path):
    model = YOLO('yolov8n.pt')  # Use yolov8m.pt or yolov8l.pt for better accuracy if you have GPU
    asset_classes = ['handbag', 'wallet', 'watch', 'laptop', 'suitcase', 'umbrella']  # Add more if needed
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
            if cls_name in asset_classes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                detected.append({
                    "class": cls_name,
                    "box": [x1, y1, x2, y2]
                })
    return {"assets": detected}

