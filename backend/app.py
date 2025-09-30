from flask import Flask, request, jsonify
import importlib
import os
import tempfile
import base64
import subprocess

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def encode_image_to_base64(image_path):
    """Convert image file to base64 string for frontend display"""
    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            # Get file extension to determine MIME type
            ext = os.path.splitext(image_path)[1].lower()
            if ext in ['.jpg', '.jpeg']:
                mime_type = 'image/jpeg'
            elif ext == '.png':
                mime_type = 'image/png'
            elif ext == '.gif':
                mime_type = 'image/gif'
            elif ext in ['.bmp']:
                mime_type = 'image/bmp'
            elif ext in ['.tiff', '.tif']:
                mime_type = 'image/tiff'
            else:
                mime_type = 'image/jpeg'  # default
            
            return f"data:{mime_type};base64,{encoded_string}"
    except Exception as e:
        print(f"[ERROR] Failed to encode image {image_path}: {e}")
        return None

@app.route('/detect', methods=['POST'])
def detect_category():
    category = request.form.get('category')  # e.g., "ocr"
    file = request.files.get('file')

    print(f"[DEBUG] Received category: {category}, file: {file.filename if file else None}")

    if not category or not file:
        print("[ERROR] Missing category or file")
        return jsonify({"success": False, "error": "Missing category or file"}), 400

    # Save file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        file.save(tmp.name)
        temp_path = tmp.name

    try:
        # Encode image for frontend display
        # image_base64 = encode_image_to_base64(temp_path)

        image_base64 = None
        ext = os.path.splitext(file.filename)[1].lower()
        if ext in ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.tif', '.webp'):
            image_base64 = encode_image_to_base64(temp_path)
        
        if category == "content":
            print(f"[DEBUG] Calling detect_content for file: {temp_path}")
            from detectors.sentiment_from_images import detect_content
            result = detect_content(temp_path, original_filename=file.filename)
        elif category == "vehicles":
            print(f"[DEBUG] Importing detectors.vehicles and calling detect_vehicles")
            from detectors.vehicles import detect_vehicles
            result = detect_vehicles(temp_path)
        elif category == "object":
            print(f"[DEBUG] Importing detectors.objects and calling detect_assets")
            from detectors.objects import detect_assets
            result = detect_assets(temp_path)
        elif category == "people":
            print(f"[DEBUG] Importing detectors.objects and calling detect_assets")
            from detectors.people import detect_people
            result = detect_people(temp_path)
        elif category == "weapons":
            print(f"[DEBUG] Importing detectors.weapons and calling detect_weapons")
            from detectors.weapons import detect_weapons
            result = detect_weapons(temp_path)
        elif category == "obscenity":
            print(f"[DEBUG] Importing detectors.nudity and calling detect_appearance")
            from detectors.nudity import detect_appearance
            result = detect_appearance(temp_path)
        elif category == "technology":
            print(f"[DEBUG] Importing detectors.technology and calling detect_technology")
            from detectors.technology import detect_technology
            result = detect_technology(temp_path)
        else:
            print(f"[DEBUG] Importing detectors.{category} and calling detect_{category}")
            detector_module = importlib.import_module(f'detectors.{category}')
            detect_func = getattr(detector_module, f'detect_{category}')
            result = detect_func(temp_path)
        
        os.remove(temp_path)  # Clean up temp file
        print(f"[DEBUG] Detection result: {result}")
        
        response_data = {
            "success": True, 
            "result": result,
            "filename": file.filename,
            "image_data": image_base64
        }
        
        return jsonify(response_data)
    except (ModuleNotFoundError, AttributeError) as e:
        print(f"[ERROR] Detector import/call failed: {e}")
        os.remove(temp_path)
        return jsonify({"success": False, "error": "Category not supported"}), 400
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        os.remove(temp_path)
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route('/process_dump', methods=['POST'])
def process_dump():
    file = request.files.get('dump_file')

    if not file:
        return jsonify({"success": False, "error": "No file provided"}), 400

    # Save dump temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        file.save(tmp.name)
        temp_path = tmp.name

    try:
        base_output_dir = r"D:\Semester7\CID"
        os.makedirs(base_output_dir, exist_ok=True)

        run_id = os.path.splitext(file.filename)[0]
        output_dir = os.path.join(base_output_dir, run_id)
        if os.path.exists(output_dir):
            import shutil
            shutil.rmtree(output_dir)
        os.makedirs(output_dir, exist_ok=True)

        def win_to_wsl_path(win_path):
            drive, rest = win_path[0], win_path[2:]
            return f"/mnt/{drive.lower()}/{rest.replace('\\', '/')}"

        temp_path_wsl = win_to_wsl_path(temp_path)
        output_dir_wsl = win_to_wsl_path(output_dir)

        command = ["wsl", "foremost", "-i", temp_path_wsl, "-o", output_dir_wsl]
        try:
            result = subprocess.run(command, check=True, capture_output=True, text=True)
            print(f"[INFO] Foremost output: {result.stdout}")
        except subprocess.CalledProcessError as e:
            print(f"[ERROR] Foremost failed: {e.stderr}")
            raise Exception("Foremost failed to process the dump file")

        folder_structure = []
        for root, dirs, files in os.walk(output_dir):
            folder_structure.append({
                "path": root,
                "folders": dirs,
                "files": files
            })

        os.remove(temp_path)

        return jsonify({"status": "success", "folder_structure": folder_structure})
    except Exception as e:
        print(f"[ERROR] Failed to process dump: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
