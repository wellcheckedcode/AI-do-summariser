import os
import mimetypes
from PIL import Image
import pypdf
import google.generativeai as genai
from dotenv import load_dotenv
import json
import base64
from io import BytesIO
import pdf2image

# Load environment variables
ab_env_path = os.path.join(os.path.dirname(__file__), "ab.env")
if os.path.exists(ab_env_path):
    load_dotenv(ab_env_path)
else:
    load_dotenv()

# Configure Gemini AI
GEN_AI_API_KEY = os.environ.get("GEN_AI_API_KEY")
genai.configure(api_key=GEN_AI_API_KEY)


def generate_universal_caption(file_data: str, filename: str, custom_prompt: str | None = None):
    """
    Generate AI summary and detect department for uploaded file.
    Accepts a base64 data URL string and original filename.
    Returns dict with keys: summary, department, priority, action_required or error.
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        mime_type, _ = mimetypes.guess_type(filename)

        if mime_type is None:
            return {
                "error": f"Could not determine the file type for {filename}",
                "summary": "",
                "department": "",
                "priority": "Low",
                "action_required": "N/A"
            }

        main_type = mime_type.split('/')[0]

        # Updated and more specific prompt for KMRL
        base_prompt = (
            "You are an AI assistant for Kochi Metro Rail Limited (KMRL). Analyze the provided document/image. "
            "Your tasks are to: "
            "1. Provide a concise summary of the document's content. "
            "2. Detect the most relevant department (HR, IT, Finance, Operations, Legal, Safety & Security, Procurement). "
            "3. Assign a priority level (High, Medium, Low). "
            "4. Suggest a clear, actionable next step as 'action_required'.\n\n"
            "**Priority Rules:**\n"
            "- **High Priority:** MUST be assigned for documents containing keywords related to: "
            "  - **Safety/Security:** 'accident', 'derailment', 'collision', 'fire', 'safety audit', 'security breach', 'unavoidable delays', 'service disruption'. "
            "  - **Legal:** 'legal notice', 'lawsuit', 'court order', 'compliance violation'. "
            "  - **Financial:** 'audit objection', 'financial loss', 'fraud', 'tender irregularity'. "
            "  - **Urgent Operations:** 'emergency maintenance', 'system failure', 'power outage', 'signal failure'.\n"
            "- **Medium Priority:** Assign for standard operational, financial, or HR reports.\n"
            "- **Low Priority:** Assign for general correspondence, newsletters, or non-critical updates.\n\n"
            "Return the response ONLY in JSON format with 'summary', 'department', 'priority', and 'action_required' fields."
        )

        prompt = f"{base_prompt}\n\nAdditional instructions from user: {custom_prompt}" if custom_prompt else base_prompt

        def process_response(response):
            try:
                # Clean the response text to ensure it's valid JSON
                clean_text = response.text.strip().replace("```json", "").replace("```", "").strip()
                result = json.loads(clean_text)
                return {
                    "summary": result.get("summary", response.text),
                    "department": result.get("department", "Unknown"),
                    "priority": result.get("priority", "Medium"),
                    "action_required": result.get("action_required", "Review required")
                }
            except json.JSONDecodeError:
                # Fallback if the response is not clean JSON
                text = response.text
                departments = ["HR", "IT", "Finance", "Operations", "Legal", "Safety & Security", "Procurement"]
                priorities = ["High", "Medium", "Low"]
                detected_dept = "Unknown"
                detected_priority = "Medium"

                for dept in departments:
                    if dept.lower() in text.lower():
                        detected_dept = dept
                        break
                for priority in priorities:
                    if priority.lower() in text.lower():
                        detected_priority = priority
                        break
                
                return {
                    "summary": text,
                    "department": detected_dept,
                    "priority": detected_priority,
                    "action_required": "Review and categorize manually"
                }

        if main_type == 'image':
            image_data = base64.b64decode(file_data.split(',')[1])
            img = Image.open(BytesIO(image_data))
            response = model.generate_content([prompt, img])
            return process_response(response)

        elif mime_type == 'application/pdf':
            pdf_data = base64.b64decode(file_data.split(',')[1])
            pdf_text = ""
            
            try:
                reader = pypdf.PdfReader(BytesIO(pdf_data))
                for page in reader.pages:
                    page_text = page.extract_text() or ""
                    pdf_text += page_text
            except Exception:
                pdf_text = ""

            if not pdf_text.strip():
                try:
                    images = pdf2image.convert_from_bytes(pdf_data, first_page=1, last_page=1)
                    if images:
                        img = images[0]
                        response = model.generate_content([prompt, img])
                        return process_response(response)
                    else:
                         return {"error": "Could not convert PDF to image for analysis", "summary": "", "department": "", "priority": "Low", "action_required": "Manual review needed"}
                except Exception as e:
                    return {"error": f"Could not process image-only PDF: {str(e)}", "summary": "", "department": "", "priority": "Low", "action_required": "Manual review needed"}
            
            response = model.generate_content([prompt, pdf_text])
            return process_response(response)

        else:
            return {"error": f"Unsupported file type '{mime_type}'.", "summary": "", "department": "", "priority": "Low", "action_required": "N/A"}

    except Exception as e:
        return {"error": f"An unexpected error occurred: {str(e)}", "summary": "", "department": "", "priority": "Low", "action_required": "N/A"}