import cv2
import numpy as np
import os
from PIL import Image
import tempfile

# Import the ifnude detector
from ifnude import detect

def detect_nudity(image_path, detection_mode="default", min_confidence=0.5, include_belly=False):
    """
    Detect nudity in an image using the ifnude library
    
    Args:
        image_path (str): Path to the image file
        detection_mode (str): "default", "fast", or "high_sensitivity"
        min_confidence (float): Minimum confidence threshold (0.0 to 1.0)
        include_belly (bool): Whether to include belly detection
    
    Returns:
        dict: Detection results with nudity regions found
    """
    try:
        # Adjust min_prob based on sensitivity settings
        actual_min_prob = min_confidence
        if detection_mode == "high_sensitivity":
            actual_min_prob = min(0.3, min_confidence)  # Cap at 0.3 for high sensitivity
        
        # Perform detection
        results = detect(image_path, mode="fast" if detection_mode == "fast" else "default", min_prob=actual_min_prob)
        
        # Enhanced detection for high sensitivity mode
        if detection_mode == "high_sensitivity" and (not results or len(results) < 2):
            # Get all results with lower threshold
            lower_threshold = actual_min_prob * 0.6  # 60% of original threshold
            additional_results = detect(image_path, mode="default", min_prob=lower_threshold)
            
            # Filter additional results to avoid duplicates
            for res in additional_results:
                if res not in results:
                    results.append(res)
        
        if not results:
            return {
                "nudity_detected": False,
                "regions": [],
                "total_regions": 0,
                "message": "No nudity detected in the image"
            }
        
        # Process results to extract relevant information
        detected_regions = []
        for result in results:
            box = result['box']
            label = result['label']
            score = result['score']
            
            # Determine confidence level
            if score > 0.7:
                confidence_level = "HIGH"
                risk_level = "CRITICAL"
            elif score > 0.5:
                confidence_level = "MEDIUM"
                risk_level = "HIGH"
            else:
                confidence_level = "LOW"
                risk_level = "MEDIUM"
            
            # Skip belly detection if not enabled
            if not include_belly and "BELLY" in label:
                continue
            
            detected_regions.append({
                "label": label,
                "confidence": round(score * 100, 1),
                "confidence_level": confidence_level,
                "risk_level": risk_level,
                "box": [int(box[0]), int(box[1]), int(box[2]), int(box[3])],
                "description": get_label_description(label)
            })
        
        return {
            "nudity_detected": len(detected_regions) > 0,
            "regions": detected_regions,
            "total_regions": len(detected_regions),
            "message": f"Detected {len(detected_regions)} potential nudity regions" if detected_regions else "No nudity detected"
        }
        
    except Exception as e:
        return {
            "error": f"Nudity detection failed: {str(e)}"
        }

def get_label_description(label):
    """Get human-readable description for nudity labels"""
    descriptions = {
        "EXPOSED_ANUS": "Exposed anal region",
        "EXPOSED_ARMPITS": "Exposed armpits",
        "EXPOSED_BELLY": "Exposed belly/stomach region",
        "EXPOSED_BREAST_F": "Exposed female breast",
        "EXPOSED_BREAST_M": "Exposed male breast",
        "EXPOSED_BUTTOCKS": "Exposed buttocks",
        "EXPOSED_FEET": "Exposed feet",
        "EXPOSED_GENITALIA_F": "Exposed female genitalia",
        "EXPOSED_GENITALIA_M": "Exposed male genitalia",
        "EXPOSED_GLUTEAL_CLEFT": "Exposed gluteal cleft",
        "EXPOSED_THIGHS": "Exposed thighs"
    }
    return descriptions.get(label, label)

# Main function to be called by app.py
def detect_appearance(image_path):
    """
    Main appearance/nudity detection function for app.py
    Uses default settings optimized for evidence analysis
    """
    return detect_nudity(
        image_path=image_path,
        detection_mode="default",
        min_confidence=0.4,  # Slightly lower threshold for evidence analysis
        include_belly=False   # Skip belly detection for less false positives
    )