<<<<<<< HEAD
# Metro Zen Flow

A comprehensive document management system with AI-powered analysis and department-specific organization.

## Features

- **AI Document Analysis**: Automatic summarization using Google Gemini AI
- **Department Detection**: Smart categorization of documents by department
- **Department-Specific Dashboards**: View documents relevant to your department
- **Document Upload & Storage**: Secure file upload with Supabase integration
- **Real-time Processing**: Instant AI analysis upon document upload

## Project Structure

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Python Flask + Google Gemini AI
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage

## Quick Start

### Option 1: Full Stack (Recommended)
```bash
# Start both frontend and backend
python start_project.py
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python start_backend.py
```

#### Frontend Setup
```bash
npm install
npm run dev
```

## Environment Setup

1. **Backend Configuration**: Ensure `backend/ab.env` contains your Google Gemini API key:
   ```
   GEN_AI_API_KEY=your_gemini_api_key_here
   ```

2. **Frontend Configuration**: Supabase credentials are already configured in `src/integrations/supabase/client.js`

## API Endpoints

- `POST /api/analyze-document` - Analyze uploaded documents
- `GET /api/health` - Health check

## Supported File Types

- PDF documents
- Image files (PNG, JPG, etc.)

## Department Categories

- HR (Human Resources)
- IT (Information Technology)  
- Finance
- Operations
- Legal
=======
>>>>>>> ac6ece699b03fed07136b12d1187ec642c4b5ef7

