from flask import Flask, request, jsonify
import importlib
import os
import tempfile

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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
        if category == "content":
            from sentiment_from_images import detect_content
            print(f"[DEBUG] Calling detect_content for file: {temp_path}")
            result = detect_content(temp_path)
        elif category == "vehicles":
            print(f"[DEBUG] Importing detectors.vehicles and calling detect_vehicles")
            from detectors.vehicles import detect_vehicles
            result = detect_vehicles(temp_path)
        else:
            print(f"[DEBUG] Importing detectors.{category} and calling detect_{category}")
            detector_module = importlib.import_module(f'detectors.{category}')
            detect_func = getattr(detector_module, f'detect_{category}')
            result = detect_func(temp_path)
        os.remove(temp_path)  # Clean up temp file
        print(f"[DEBUG] Detection result: {result}")
        return jsonify({"success": True, "result": result})
    except (ModuleNotFoundError, AttributeError) as e:
        print(f"[ERROR] Detector import/call failed: {e}")
        os.remove(temp_path)
        return jsonify({"success": False, "error": "Category not supported"}), 400
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        os.remove(temp_path)
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)