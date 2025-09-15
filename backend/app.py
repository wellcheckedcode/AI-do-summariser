from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables (prefer ab.env if present, else fallback to .env)
if os.path.exists(os.path.join(os.path.dirname(__file__), "ab.env")):
    load_dotenv(os.path.join(os.path.dirname(__file__), "ab.env"))
else:
    load_dotenv()

app = Flask(__name__)
CORS(app)

# Import analyzer logic from separate module
from analyzer import generate_universal_caption

# Optionally register Gmail blueprint if present
try:
    from gmail_service import gmail_bp
    app.register_blueprint(gmail_bp, url_prefix='/api/gmail')
except Exception as _e:
    # Gmail module not configured yet; endpoints won't be available
    pass


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

