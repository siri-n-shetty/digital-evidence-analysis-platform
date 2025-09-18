import cv2
from ultralytics import YOLO

def detect_weapons_custom_model(image_path, model_path=None):
    """
    Alternative function for custom weapon detection model
    Use this if you have a specifically trained weapon detection model
    """
    try:
        import os
        
        # Use custom model if provided, otherwise default YOLOv8
        if model_path and os.path.exists(model_path):
            model = YOLO(model_path)
        else:
            # Try to use a custom weapon model if available
            custom_model_paths = [
                'yolov8_weapons.pt',
                'weapons_model.pt',
                'best.pt'
            ]
            
            model_found = False
            for path in custom_model_paths:
                if os.path.exists(path):
                    model = YOLO(path)
                    model_found = True
                    print(f"[DEBUG] Using custom weapon model: {path}")
                    break
            
            if not model_found:
                print("[DEBUG] No custom weapon model found, falling back to standard detection")
                return {"error": "No custom model found"}
        
        # Load and process image
        image = cv2.imread(image_path)
        if image is None:
            return {"error": f"Could not load image: {image_path}"}
        
        # Run inference
        results = model(image)
        detected_weapons = []
        
        for result in results:
            if result.boxes is not None:
                boxes = result.boxes
                for box in boxes:
                    # Get class information
                    cls_id = int(box.cls[0])
                    cls_name = result.names[cls_id]
                    confidence = float(box.conf[0])
                    
                    # For custom models, accept all detections above threshold
                    if confidence >= 0.5:
                        # Get bounding box coordinates
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        
                        # Assign danger level based on weapon type
                        if any(weapon in cls_name.lower() for weapon in ['gun', 'pistol', 'rifle', 'knife', 'blade']):
                            danger_level = "CRITICAL"
                        elif any(weapon in cls_name.lower() for weapon in ['hammer', 'axe', 'bat']):
                            danger_level = "HIGH"
                        else:
                            danger_level = "MEDIUM"
                        
                        detected_weapons.append({
                            "class": cls_name,
                            "confidence": round(confidence * 100, 1),
                            "danger_level": danger_level,
                            "box": [x1, y1, x2, y2]
                        })
        
        # Sort by danger level and confidence
        danger_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2}
        detected_weapons.sort(key=lambda x: (danger_order.get(x['danger_level'], 3), -x['confidence']))
        
        return {"weapons": detected_weapons}
        
    except Exception as e:
        return {"error": f"Custom weapon detection failed: {str(e)}"}

def detect_weapons_standard(image_path):
    """
    Detect weapons (guns, knives, etc.) in an image using YOLOv8
    Uses pre-trained YOLOv8 model and filters for weapon-related classes
    """
    try:
        # Load YOLOv8 model (using nano version for faster inference)
        model = YOLO('yolov8n.pt')
        
        # Weapon-related classes from COCO dataset
        # Note: COCO doesn't have specific weapon classes, but we can detect some related objects
        weapon_classes = [
            'knife',           # Class 43 in COCO
            'scissors',        # Class 76 in COCO (sharp object)
            'baseball bat',    # Class 39 in COCO (potential weapon)
        ]
        
        # Additional classes that could be weapons or dangerous objects
        potential_weapon_classes = [
            'bottle',          # Can be used as weapon
            'hammer',          # Tool that can be weapon
            'axe',             # Sharp tool
        ]
        
        # Combine all classes we want to detect
        all_weapon_classes = weapon_classes + potential_weapon_classes
        
        # Load and process image
        image = cv2.imread(image_path)
        if image is None:
            return {"error": f"Could not load image: {image_path}"}
        
        # Run inference
        results = model(image)
        detected_weapons = []
        
        for result in results:
            if result.boxes is not None:
                boxes = result.boxes
                for box in boxes:
                    # Get class information
                    cls_id = int(box.cls[0])
                    cls_name = result.names[cls_id]
                    confidence = float(box.conf[0])
                    
                    # Check if detected class is in our weapon classes
                    if cls_name in all_weapon_classes and confidence >= 0.4:  # Lower threshold for weapons
                        # Get bounding box coordinates
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        
                        # Classify danger level
                        if cls_name in weapon_classes:
                            danger_level = "HIGH"
                        else:
                            danger_level = "MEDIUM"
                        
                        detected_weapons.append({
                            "class": cls_name,
                            "confidence": round(confidence * 100, 1),
                            "danger_level": danger_level,
                            "box": [x1, y1, x2, y2]
                        })
        
        # Sort by confidence (highest first)
        detected_weapons.sort(key=lambda x: x['confidence'], reverse=True)
        
        return {"weapons": detected_weapons}
        
    except Exception as e:
        return {"error": f"Weapon detection failed: {str(e)}"}

# Main function that will be called by app.py
def detect_weapons_main(image_path):
    """
    Main weapon detection function
    Tries custom model first, falls back to standard detection
    """
    import os
    
    # First try custom weapon detection model
    result = detect_weapons_custom_model(image_path)
    
    # If custom model failed or no weapons found, try standard detection
    if "error" in result or (result.get("weapons") and len(result["weapons"]) == 0):
        print("[DEBUG] Trying standard YOLOv8 detection for potential weapons")
        standard_result = detect_weapons_standard(image_path)
        
        # Always return the standard result (even if empty) rather than custom model error
        return standard_result
    
    return result

# Main function to be called by app.py
detect_weapons = detect_weapons_main
