# Metro Zen Flow Backend

This backend service provides AI-powered document analysis for the Metro Zen Flow application.

## Features

- **Document Analysis**: Uses Google Gemini AI to analyze uploaded documents (PDF, images)
- **Department Detection**: Automatically detects which department a document belongs to
- **AI Summaries**: Generates concise summaries of document content
- **REST API**: Provides endpoints for document analysis and health checks

## Setup

### Gmail Import Setup

1. Create a Google Cloud project and enable the Gmail API.
2. Configure an OAuth 2.0 Client ID (type: Web Application):
   - Authorized redirect URI: http://localhost:5000/api/gmail/callback
3. Download the OAuth client JSON and place it at backend/client_secret.json or set GMAIL_CLIENT_SECRETS_FILE in ab.env.
4. Add these to backend/ab.env:
   - GMAIL_OAUTH_REDIRECT_URI=http://localhost:5000/api/gmail/callback
   - SUPABASE_URL=your_supabase_url
   - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   - SUPABASE_BUCKET=documents

Security notes:
- The Service Role Key is powerful; keep backend/ab.env private. Do not expose it to the frontend.
- The sample stores OAuth tokens in memory keyed by a transient state; for production, persist per-user credentials securely (DB or encrypted store) and map to your Supabase user IDs.

### Prerequisites

- Python 3.8 or higher
- Google Gemini API key (configured in `ab.env`)

### Installation

1. Navigate to the backend directory:
   ```bash
   cd metro-zen-flow/backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Make sure your `ab.env` file contains the required environment variables:
   ```
   GEN_AI_API_KEY=your_gemini_api_key_here
   ```

### Running the Server

#### Option 1: Using the startup script
```bash
python start_backend.py
```

#### Option 2: Direct execution
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /api/analyze-document
Analyzes an uploaded document and returns AI summary with department detection.

**Request Body:**
```json
{
  "file_data": "base64_encoded_file_data",
  "filename": "document.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "summary": "AI-generated summary of the document",
  "department": "HR|IT|Finance|Operations|Legal"
}
```

### GET /api/health
Health check endpoint to verify the service is running.

**Response:**
```json
{
  "status": "healthy",
  "message": "Backend API is running"
}
```

## Supported File Types

- **PDF**: Extracts text and analyzes content
- **Images**: Analyzes visual content (PNG, JPG, etc.)

## Department Detection

The AI automatically detects which department a document belongs to from the following options:
- HR (Human Resources)
- IT (Information Technology)
- Finance
- Operations
- Legal

## Error Handling

The API includes comprehensive error handling for:
- Invalid file types
- Missing required fields
- AI service failures
- File processing errors

## Integration

This backend integrates with the Metro Zen Flow frontend to:
1. Process uploaded documents
2. Generate AI summaries
3. Detect appropriate departments
4. Store results in Supabase database
5. Display department-specific documents in dashboards

