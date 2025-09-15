import os
import mimetypes
from PIL import Image
import pypdf
import google.generativeai as genai
from dotenv import load_dotenv
import json
import base64
from io import BytesIO
import pdf2image  # For converting PDF to images

# Load environment variables (prefer ab.env if present, else fallback to .env)
ab_env_path = os.path.join(os.path.dirname(__file__), "ab.env")
if os.path.exists(ab_env_path):
    load_dotenv(ab_env_path)
else:
    load_dotenv()

# Configure Gemini AI
GEN_AI_API_KEY = os.environ.get("GEN_AI_API_KEY")
genai.configure(api_key=GEN_AI_API_KEY)


def generate_universal_caption(file_data: str, filename: str):
    """
    Generate AI summary and detect department for uploaded file.
    Accepts a base64 data URL string and original filename.
    Returns dict with keys: summary, department or error.
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
            prompt = "Analyze this document image and provide a summary. Also detect the department to which it should belong (HR, IT, Finance, Operations, Legal). Return the response in JSON format with 'summary' and 'department' fields."

            # Convert base64 to PDF data
            pdf_data = base64.b64decode(file_data.split(',')[1])
            pdf_text = ""
            
            # First try to extract text
            try:
                reader = pypdf.PdfReader(BytesIO(pdf_data))
                for page in reader.pages:
                    page_text = page.extract_text() or ""
                    pdf_text += page_text
                print(f"DEBUG: Extracted {len(pdf_text)} characters from PDF")
            except Exception as e:
                print(f"DEBUG: PDF text extraction failed: {e}")
                pdf_text = ""

            # If no text extracted, convert PDF to image and analyze with Gemini
            if not pdf_text.strip():
                print(f"DEBUG: PDF appears to be image-only, converting to image for analysis")
                try:
                    # Convert PDF to image using pdf2image
                    images = pdf2image.convert_from_bytes(pdf_data, first_page=1, last_page=1)
                    if images:
                        # Get the first page as PIL Image
                        img = images[0]
                        print(f"DEBUG: Converted PDF to image, size: {img.size}")
                        
                        # Analyze with Gemini
                        response = model.generate_content([prompt, img])
                        print(f"DEBUG: Gemini response: {response.text}")
                        
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
                            "error": "Could not convert PDF to image for analysis",
                            "summary": "",
                            "department": ""
                        }
                except Exception as e:
                    print(f"DEBUG: PDF to image conversion failed: {e}")
                    return {
                        "error": f"Could not process image-only PDF: {str(e)}",
                        "summary": "",
                        "department": ""
                    }

            # If text was extracted, analyze it normally
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

