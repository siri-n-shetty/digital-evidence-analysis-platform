# Digital Evidence Analysis Platform

- Modern investigations encounter massive volumes of digital media that may contain evidence. Manually inspecting this content is slow, error-prone and resource intensive.
- This **Cyber Forensic Tool** was developed by our team during the internship at the **Centre for Cybercrime Investigation Training & Research (CCITR), the Cybercrime Division of Criminal Investigation Department (CID), Government of Karnataka**.  
- It is designed to assist forensic investigators in analyzing and categorizing **multimedia evidence** extracted from forensic dumps. The system reduces investigator workload, accelerates review cycles and improves consistency, while being designed to respect legal and ethical constraints.
- The tool is open-source and can be further extended by researchers, developers, and law enforcement professionals.

## Detection Categories

1. *Content Analysis*
      - Text Extraction: Supports multiple formats (PDF, DOCX, TXT, images)
      - Sentiment Analysis: Advanced suicide risk detection using transformer models
      - OCR Processing: Extracts text from images using EasyOCR
      - Danger Word Detection: Identifies and highlights concerning language
      - File Type Support: .pdf, .docx, .txt, .jpg, .png, .gif, .bmp, .tiff
2. *Vehicle Detection* 
      - YOLO-based Detection: Identifies cars, motorcycles, buses, trucks, boats, bicycles
      - License Plate Recognition: OCR extraction from detected vehicles
      - Confidence Scoring: Detection accuracy metrics
3. *Object Detection* 
      - Asset Recognition: Laptops, handbags, watches, and valuable items
      - YOLO Integration: Real-time object detection
      - Coordinate Mapping: Exact object locations
      - Multi-object Support: Detects multiple items in single image
4. *Weapon Detection* 
      - Custom YOLO Model: Specialized weapon identification
      - Danger Level Classification: Critical, High, Medium risk levels
5. *Technology Detection* 
      - Tech Item Recognition: TV, laptop, mouse, remote, keyboard, cell phone
      - Confidence Thresholds: Accurate detection with score filtering
6. *Appearance/Nudity Detection* 
      - Advanced Content Filtering: Uses ifnude library for detection
      - Risk Assessment: Multiple confidence levels and categories
      - Privacy Protection: Secure processing of sensitive content
      - Region Detection: Identifies specific areas of concern
  
## Features

1. *Forensic Dump Processing*
      - Upload Forensic Dumps: Users can upload forensic dump files through the frontend.
      - File Carving with Foremost: The backend processes the dump files using the foremost tool (via WSL) to extract files.
      - Custom Output Directory: Extracted files are stored in a custom directory (D:/CID_Extracted), organized by unique subfolders for each run.
      - Folder Structure Generation: The backend generates a detailed folder structure of the extracted files and returns it to the frontend.
2. *Category-Based Detection*
      - Category Selection: Users can select a category (e.g., "content", "vehicles", "weapons", etc.) for analysis.
      - Dynamic Detector Loading: The backend dynamically imports and executes the appropriate detection module based on the selected category.

## Technology Stack

### Backend

- Framework: Flask (Python)
- AI/ML Models:
      - YOLOv8 for object/vehicle/weapon detection
      - Transformers (Hugging Face) for sentiment analysis
      - EasyOCR for text extraction
      - ifnude for nudity detection
- Image Processing: OpenCV, PIL
- Document Processing: pdfplumber, python-docx
- CORS: Flask-CORS for cross-origin requests

### Frontend

- Framework: React.js
- Styling: Tailwind CSS
