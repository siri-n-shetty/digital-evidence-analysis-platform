# import os
# import cv2
# from ultralytics import YOLO

# # Load YOLO model once (replace with your custom weapons model if available)
# model_path = r'D:\Semester7\CID\final-workflow\backend\yolov8n.pt'
# model = YOLO(model_path)

# def detect_weapons(image_path):
#     """Detect weapons (guns, knives, etc.) in the given image."""

#     # NOTE: Default COCO model only has 'knife'. 
#     weapon_classes = {"knife", "scissors"}  

#     image = cv2.imread(image_path)
#     if image is None:
#         return {"category": "weapons", "detections": [], "error": f"Image {image_path} not found."}

#     results = model(image)
#     detections = []

#     for result in results:
#         for box in result.boxes:
#             cls_id = int(box.cls[0])
#             label = result.names[cls_id]
#             if label in weapon_classes:
#                 x1, y1, x2, y2 = map(int, box.xyxy[0])
#                 confidence = round(float(box.conf[0]), 2)
#                 detections.append({
#                     "label": label,
#                     "confidence": confidence,
#                     "bbox": [x1, y1, x2, y2]
#                 })

#     return {
#         "category": "weapons",
#         "detections": detections
#     }

import cv2
import numpy as np
from PIL import Image
import base64
from ultralytics import YOLO

# Load your trained YOLO model (replace with your custom model path)
model_path = r"D:\Semester7\CID\final-workflow\backend\detectors\runs\detect\Normal_Compressed\weights\best.pt"
weapon_model = YOLO(model_path)

def detect_weapons(image_path):
    """
    Detect weapons (guns, knives, etc.) in a given image file path.
    Returns:
        processed_image (str): Base64-encoded image with bounding boxes drawn
        results_dict (dict): Detection results with labels, confidence, and bounding boxes
    """
    try:
        # Check if the file is an image
        ext = image_path.split('.')[-1].lower()
        if ext not in ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif']:
            return None, {"category": "weapons", "error": f"Unsupported file type: {ext}"}

        # Load the image using PIL
        image_pil = Image.open(image_path).convert("RGB")

        # Convert PIL image to OpenCV format
        image = cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)

        # Run YOLO detection
        results = weapon_model(image)

        detections = []
        weapon_detected = False

        for result in results:
            classes = result.names
            cls = result.boxes.cls
            conf = result.boxes.conf
            detections_xyxy = result.boxes.xyxy

            for pos, detection in enumerate(detections_xyxy):
                confidence = float(conf[pos])
                if confidence >= 0.5:  # confidence threshold
                    label_name = classes[int(cls[pos])].lower()
                    
                    if any(x in label_name for x in ["gun", "knife"]):
                        weapon_detected = True

                    xmin, ymin, xmax, ymax = map(int, detection.tolist())
                    label = f"{classes[int(cls[pos])]} {confidence:.2f}"
                    color = (0, int(cls[pos]) * 40 % 255, 255)

                    # Draw bounding box + label
                    cv2.rectangle(image, (xmin, ymin), (xmax, ymax), color, 2)
                    cv2.putText(image, label, (xmin, ymin - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

                    detections.append({
                        "label": label_name,
                        "confidence": round(confidence, 2),
                        "bbox": [xmin, ymin, xmax, ymax]
                    })

        # Convert back to PIL for return
        processed_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))

        # Convert PIL image to base64 string
        buffered = cv2.imencode('.jpg', np.array(processed_image))[1]
        base64_image = base64.b64encode(buffered).decode('utf-8')

        results_dict = {
            "category": "weapons",
            "weapon_detected": weapon_detected,
            "detections": detections
        }

        return base64_image, results_dict

    except Exception as e:
        print(f"[ERROR] Failed to process image: {e}")
        return None, {"category": "weapons", "error": str(e)}