from flask import Flask, request, jsonify, send_from_directory
import os
import cv2
from ultralytics import YOLO
import traceback
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def process_folder(input_dir, categories=None):
    print(f"[DEBUG] Starting process_folder for: {input_dir}, categories: {categories}")
    output_img_dir = os.path.join(input_dir, "suspicious_images")
    output_vid_dir = os.path.join(input_dir, "suspicious_videos")
    os.makedirs(output_img_dir, exist_ok=True)
    os.makedirs(output_vid_dir, exist_ok=True)

    yolo_model = YOLO('./runs/detect/Normal_Compressed/weights/best.pt')
    processed_images = []
    processed_videos = []

    # Process images
    for filename in os.listdir(input_dir):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
            image_path = os.path.join(input_dir, filename)
            image = cv2.imread(image_path)
            results = yolo_model(image)
            suspicious = False
            out_image = image.copy()
            out_name = None

            for result in results:
                classes = result.names
                cls = result.boxes.cls
                conf = result.boxes.conf
                detections = result.boxes.xyxy

                for pos, detection in enumerate(detections):
                    if conf[pos] >= 0.5:
                        category = classes[int(cls[pos])]
                        confidence = int(conf[pos] * 100)
                        label = f"{category} {confidence}%"
                        xmin, ymin, xmax, ymax = detection
                        color = (0, int(cls[pos]) * 40 % 256, 255)
                        cv2.rectangle(out_image, (int(xmin), int(ymin)), (int(xmax), int(ymax)), color, 2)
                        cv2.putText(out_image, label, (int(xmin), int(ymin) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2, cv2.LINE_AA)
                        if not suspicious:
                            out_name = f"{os.path.splitext(filename)[0]}_{category}_{confidence}{os.path.splitext(filename)[1]}"
                            suspicious = True
                if suspicious:
                    break
            if suspicious and out_name:
                out_path = os.path.join(output_img_dir, out_name)
                # Save the image
                cv2.imwrite(out_path, out_image)
                print(f"[DEBUG] Image saved: {out_path}")
                # Always append the actual filename used
                processed_images.append(os.path.relpath(out_path, start="D:/CID/Internship/Project").replace("\\", "/"))
    # Process videos
    for filename in os.listdir(input_dir):
        if filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
            video_path = os.path.join(input_dir, filename)
            cap = cv2.VideoCapture(video_path)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            fourcc = cv2.VideoWriter_fourcc(*'XVID')
            out_name = None
            suspicious = False
            out_video = None

            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                results = yolo_model(frame)
                for result in results:
                    classes = result.names
                    cls = result.boxes.cls
                    conf = result.boxes.conf
                    detections = result.boxes.xyxy
                    for pos, detection in enumerate(detections):
                        if conf[pos] >= 0.5:
                            category = classes[int(cls[pos])]
                            confidence = int(conf[pos] * 100)
                            label = f"{category} {confidence}%"
                            xmin, ymin, xmax, ymax = detection
                            color = (0, int(cls[pos]) * 40 % 256, 255)
                            cv2.rectangle(frame, (int(xmin), int(ymin)), (int(xmax), int(ymax)), color, 2)
                            cv2.putText(frame, label, (int(xmin), int(ymin) - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2, cv2.LINE_AA)
                            if not suspicious:
                                out_name = f"{os.path.splitext(filename)[0]}_{category}_{confidence}{os.path.splitext(filename)[1]}"
                                out_path = os.path.join(output_vid_dir, out_name)
                                out_video = cv2.VideoWriter(out_path, fourcc, fps, (width, height))
                                suspicious = True
                    if suspicious:
                        break
                if suspicious and out_video:
                    out_video.write(frame)
            cap.release()
            if out_video:
                out_video.release()
                processed_videos.append(out_path)
    print(f"[DEBUG] Finished processing. Images: {len(processed_images)}, Videos: {len(processed_videos)}")
    return {
        "images": processed_images,
        "videos": processed_videos
    }

@app.route('/process', methods=['POST'])
def process():
    try:
        data = request.get_json()
        print(f"[DEBUG] Received request data: {data}")
        input_dir = data.get('input_dir')
        categories = data.get('categories')
        if not input_dir or not os.path.isdir(input_dir):
            print(f"[ERROR] Invalid or missing input_dir: {input_dir}")
            return jsonify({"error": "Invalid or missing input_dir"}), 400
        result = process_folder(input_dir, categories)
        print(f"[DEBUG] Returning result: {result}")
        return jsonify({"status": "done", "result": result})
    except Exception as e:
        print(f"[ERROR] Exception in /process: {e}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/files/<path:filename>')
def serve_file(filename):
    # Change this base path to match your project root
    base_dir = os.path.abspath("D:/CID/Internship/Project")
    print(f"[DEBUG] Serving file: {filename} from {base_dir}")
    return send_from_directory(base_dir, filename)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
