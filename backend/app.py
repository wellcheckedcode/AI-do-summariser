from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import mimetypes
from PIL import Image
import textwrap
import pypdf
import google.generativeai as genai
from dotenv import load_dotenv
import json
import base64
from io import BytesIO

# Load environment variables (prefer ab.env if present, else fallback to .env)
if os.path.exists(os.path.join(os.path.dirname(__file__), "ab.env")):
    load_dotenv(os.path.join(os.path.dirname(__file__), "ab.env"))
else:
    load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini AI
GEN_AI_API_KEY = os.environ.get("GEN_AI_API_KEY")
genai.configure(api_key=GEN_AI_API_KEY)

def generate_universal_caption(file_data, filename):
    """
    Generate AI summary and detect department for uploaded file
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        mime_type, _ = mimetypes.guess_type(filename)
        
        if mime_type is None:
            return {
                "error": f"Could not determine the file type for {filename}",
                "summary": "",
                "department": ""
            }
        
        main_type = mime_type.split('/')[0]

        if main_type == 'image':
            print(f"✅ Detected image file: {filename}")
            prompt = "Generate a short, descriptive summary for this image and detect the department to which it should belong (HR, IT, Finance, Operations, Legal). Return the response in JSON format with 'summary' and 'department' fields."
            
            # Convert base64 to image
            image_data = base64.b64decode(file_data.split(',')[1])
            img = Image.open(BytesIO(image_data))
            response = model.generate_content([prompt, img])
            
            try:
                result = json.loads(response.text)
                return {
                    "summary": result.get("summary", response.text),
                    "department": result.get("department", "Unknown")
                }
            except json.JSONDecodeError:
                # If response is not JSON, extract department from text
                text = response.text
                departments = ["HR", "IT", "Finance", "Operations", "Legal"]
                detected_dept = "Unknown"
                for dept in departments:
                    if dept.lower() in text.lower():
                        detected_dept = dept
                        break
                
                return {
                    "summary": text,
                    "department": detected_dept
                }

        elif mime_type == 'application/pdf':
            print(f"✅ Detected PDF file: {filename}")
            prompt = "Summarize this document into a single, concise summary and detect the department to which it should belong (HR, IT, Finance, Operations, Legal). Return the response in JSON format with 'summary' and 'department' fields."
            
            # Convert base64 to PDF text
            pdf_data = base64.b64decode(file_data.split(',')[1])
            pdf_text = ""
            reader = pypdf.PdfReader(BytesIO(pdf_data))
            for page in reader.pages:
                pdf_text += page.extract_text()
            
            if not pdf_text.strip():
                return {
                    "error": "Could not extract any text from this PDF. It might be an image-only PDF.",
                    "summary": "",
                    "department": ""
                }

            response = model.generate_content([prompt, pdf_text])
            
            try:
                result = json.loads(response.text)
                return {
                    "summary": result.get("summary", response.text),
                    "department": result.get("department", "Unknown")
                }
            except json.JSONDecodeError:
                # If response is not JSON, extract department from text
                text = response.text
                departments = ["HR", "IT", "Finance", "Operations", "Legal"]
                detected_dept = "Unknown"
                for dept in departments:
                    if dept.lower() in text.lower():
                        detected_dept = dept
                        break
                
                return {
                    "summary": text,
                    "department": detected_dept
                }
        
        else:
            return {
                "error": f"Unsupported file type '{mime_type}'. This function supports images and .pdf files.",
                "summary": "",
                "department": ""
            }

    except Exception as e:
        return {
            "error": f"An unexpected error occurred: {str(e)}",
            "summary": "",
            "department": ""
        }

@app.route('/api/analyze-document', methods=['POST'])
def analyze_document():
    """
    Analyze uploaded document and return AI summary with department detection
    """
    try:
        data = request.get_json()
        
        if not data or 'file_data' not in data or 'filename' not in data:
            return jsonify({
                "error": "Missing required fields: file_data and filename"
            }), 400
        
        file_data = data['file_data']
        filename = data['filename']
        
        result = generate_universal_caption(file_data, filename)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify({
            "success": True,
            "summary": result['summary'],
            "department": result['department']
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        "status": "healthy",
        "message": "Backend API is running"
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

