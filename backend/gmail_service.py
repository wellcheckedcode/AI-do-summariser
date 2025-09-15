import os
import base64
import json
from io import BytesIO
from typing import Optional, Tuple, List

from flask import Blueprint, request, jsonify, redirect
from dotenv import load_dotenv

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

import requests

from analyzer import generate_universal_caption

# Load environment variables
ab_env_path = os.path.join(os.path.dirname(__file__), "ab.env")
if os.path.exists(ab_env_path):
    load_dotenv(ab_env_path)
else:
    load_dotenv()

GMAIL_CLIENT_SECRETS_FILE = os.environ.get("GMAIL_CLIENT_SECRETS_FILE", os.path.join(os.path.dirname(__file__), "client_secret.json"))
GMAIL_OAUTH_REDIRECT_URI = os.environ.get("GMAIL_OAUTH_REDIRECT_URI", "http://localhost:5000/api/gmail/callback")
GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

# Supabase info (for server-side uploads and DB insert)
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("VITE_SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_BUCKET = os.environ.get("SUPABASE_BUCKET", "documents")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    # We won't crash on import, but endpoints will error until configured
    pass

# In-memory token store keyed by a simple session key. In production, use a DB/session.
_token_store = {}

gmail_bp = Blueprint('gmail', __name__)


def _get_flow(state: Optional[str] = None) -> Flow:
    flow = Flow.from_client_secrets_file(
        GMAIL_CLIENT_SECRETS_FILE,
        scopes=GMAIL_SCOPES,
        redirect_uri=GMAIL_OAUTH_REDIRECT_URI,
    )
    if state:
        flow.fetch_token(state=state)
    return flow


def _build_service(creds: Credentials):
    return build('gmail', 'v1', credentials=creds, cache_discovery=False)


@gmail_bp.route('/auth-url', methods=['GET'])
def auth_url():
    """
    Returns a Google OAuth URL to authorize Gmail access.
    Expects optional user_id query param so we can store documents under the user's folder.
    """
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400

        flow = Flow.from_client_secrets_file(
            GMAIL_CLIENT_SECRETS_FILE,
            scopes=GMAIL_SCOPES,
            redirect_uri=GMAIL_OAUTH_REDIRECT_URI,
        )
        auth_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
        )
        # Save state mapping to user_id
        _token_store[state] = {"user_id": user_id}
        return jsonify({"auth_url": auth_url, "state": state})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gmail_bp.route('/callback', methods=['GET'])
def oauth_callback():
    try:
        state = request.args.get('state')
        code = request.args.get('code')
        error = request.args.get('error')
        
        # Handle OAuth errors
        if error:
            return f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Gmail Authorization Error</title>
                <style>
                    body {{ font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #ff6b6b; color: white; }}
                    .container {{ background: rgba(255,255,255,0.1); padding: 30px; border-radius: 10px; max-width: 400px; margin: 0 auto; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                    <div style="font-size: 18px; margin-bottom: 20px;">Authorization Failed</div>
                    <div style="font-size: 14px; opacity: 0.8;">Error: {error}</div>
                </div>
                <script>setTimeout(() => window.close(), 3000);</script>
            </body>
            </html>
            """, 400
        
        if not state or not code or state not in _token_store:
            return jsonify({"error": "Invalid OAuth state or missing code"}), 400

        flow = Flow.from_client_secrets_file(
            GMAIL_CLIENT_SECRETS_FILE,
            scopes=GMAIL_SCOPES,
            redirect_uri=GMAIL_OAUTH_REDIRECT_URI,
        )
        flow.fetch_token(code=code)
        creds = flow.credentials

        # Store credentials in memory; in prod, store securely per user
        _token_store[state]["credentials"] = {
            "token": creds.token,
            "refresh_token": creds.refresh_token,
            "token_uri": creds.token_uri,
            "client_id": creds.client_id,
            "client_secret": creds.client_secret,
            "scopes": creds.scopes,
        }

        # Close the popup/tab with a friendly message
        return (
            """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Gmail Authorization Successful</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        margin: 0;
                    }
                    .container {
                        background: rgba(255,255,255,0.1);
                        padding: 30px;
                        border-radius: 10px;
                        backdrop-filter: blur(10px);
                        max-width: 400px;
                        margin: 0 auto;
                    }
                    .success-icon {
                        font-size: 48px;
                        margin-bottom: 20px;
                    }
                    .message {
                        font-size: 18px;
                        margin-bottom: 20px;
                    }
                    .sub-message {
                        font-size: 14px;
                        opacity: 0.8;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="success-icon">✅</div>
                    <div class="message">Gmail Authorization Successful!</div>
                    <div class="sub-message">You can now close this window and return to the application.</div>
                </div>
                <script>
                    setTimeout(() => {
                        window.close();
                    }, 2000);
                </script>
            </body>
            </html>
            """,
            200,
            {"Content-Type": "text/html"}
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@gmail_bp.route('/import', methods=['POST'])
def import_attachments():
    """
    Fetches recent messages with attachments from Gmail and uploads them to Supabase.
    Body: { state: string, query?: string, max_results?: number }
    Returns: { imported: number, details: [...]} where details has per-file info.
    """
    try:
        data = request.get_json(force=True)
        state = data.get('state')
        query = data.get('query', 'has:attachment newer_than:30d')  # Start with any attachments, not just unread
        max_results = int(data.get('max_results', 25))

        if not state or state not in _token_store:
            return jsonify({"error": "Missing or invalid state. Authenticate first."}), 400
        entry = _token_store[state]
        user_id = entry.get('user_id')
        cred_dict = entry.get('credentials')
        if not cred_dict:
            return jsonify({"error": "Not authorized yet. Complete OAuth flow."}), 400

        creds = Credentials(
            token=cred_dict.get('token'),
            refresh_token=cred_dict.get('refresh_token'),
            token_uri=cred_dict.get('token_uri'),
            client_id=cred_dict.get('client_id'),
            client_secret=cred_dict.get('client_secret'),
            scopes=cred_dict.get('scopes'),
        )

        service = _build_service(creds)

        # List messages matching the query
        messages = []
        print(f"DEBUG: Searching Gmail with query: {query}")
        print(f"DEBUG: User ID: {user_id}")
        print(f"DEBUG: Max results: {max_results}")

        try:
            resp = service.users().messages().list(userId='me', q=query, maxResults=max_results).execute()
            messages.extend(resp.get('messages', []))
            print(f"DEBUG: Found {len(messages)} messages matching query")
            print(f"DEBUG: Response keys: {list(resp.keys())}")
            if 'nextPageToken' in resp:
                print(f"DEBUG: Has next page token: {resp['nextPageToken']}")
        except Exception as e:
            print(f"DEBUG: Error with main query: {e}")
            messages = []

        # Also try a broader search to see if there are any messages at all
        if len(messages) == 0:
            print("DEBUG: No messages found with unread query, trying broader search...")
            
            # Try different queries in order of preference
            fallback_queries = [
                'is:unread has:attachment',  # Unread with attachments (no date limit)
                'has:attachment newer_than:7d',  # Any attachments in last 7 days
                'has:attachment newer_than:30d', # Any attachments in last 30 days
                'is:unread',  # Just unread messages
                'has:attachment'  # Any messages with attachments
            ]
            
            for fallback_query in fallback_queries:
                try:
                    print(f"DEBUG: Trying fallback query: '{fallback_query}'")
                    fallback_resp = service.users().messages().list(userId='me', q=fallback_query, maxResults=10).execute()
                    fallback_messages = fallback_resp.get('messages', [])
                    print(f"DEBUG: Found {len(fallback_messages)} messages with query: '{fallback_query}'")
                    
                    if len(fallback_messages) > 0:
                        print(f"DEBUG: Using fallback query results: '{fallback_query}'")
                        messages = fallback_messages
                        break
                except Exception as e:
                    print(f"DEBUG: Error with fallback query '{fallback_query}': {e}")
                    continue

        details = []
        imported_count = 0

        for m in messages:
            try:
                print(f"DEBUG: Processing message {m['id']}")
                msg = service.users().messages().get(userId='me', id=m['id']).execute()
                parts = (msg.get('payload', {}) or {}).get('parts', [])
                subject = None
                headers = msg.get('payload', {}).get('headers', [])
                for h in headers:
                    if h.get('name') == 'Subject':
                        subject = h.get('value')
                        break
                
                print(f"DEBUG: Message subject: {subject}")
                print(f"DEBUG: Message has {len(parts)} parts")

                # Traverse parts for attachments (including nested parts)
                attachment_count = 0
                
                def process_parts(parts_list, level=0):
                    nonlocal attachment_count
                    indent = "  " * level
                    for part in parts_list:
                        filename = part.get('filename')
                        body = part.get('body', {})
                        att_id = body.get('attachmentId')
                        mime_type = part.get('mimeType')
                        sub_parts = part.get('parts', [])
                        
                        print(f"DEBUG: {indent}Part - filename: {filename}, mimeType: {mime_type}, hasAttachmentId: {bool(att_id)}, hasSubParts: {len(sub_parts)}")
                        
                        if filename and att_id:
                            attachment_count += 1
                            print(f"DEBUG: {indent}Found attachment: {filename} ({mime_type})")
                        elif sub_parts:
                            print(f"DEBUG: {indent}Processing {len(sub_parts)} sub-parts...")
                            process_parts(sub_parts, level + 1)
                
                process_parts(parts)
                print(f"DEBUG: Total attachments found in message: {attachment_count}")

                # Now process each attachment for import
                def process_attachments(parts_list):
                    nonlocal imported_count
                    for part in parts_list:
                        filename = part.get('filename')
                        body = part.get('body', {})
                        att_id = body.get('attachmentId')
                        mime_type = part.get('mimeType')
                        sub_parts = part.get('parts', [])
                        
                        if filename and att_id:
                            try:
                                print(f"DEBUG: Processing attachment: {filename}")
                                # Fetch attachment data
                                att = service.users().messages().attachments().get(userId='me', messageId=m['id'], id=att_id).execute()
                                data_b64 = att.get('data')
                                if not data_b64:
                                    print(f"DEBUG: No data for attachment {filename}")
                                    continue

                                file_bytes = base64.urlsafe_b64decode(data_b64)
                                data_url = f"data:{mime_type};base64,{base64.b64encode(file_bytes).decode()}"

                                # Analyze with Gemini
                                print(f"DEBUG: Starting AI analysis for {filename}")
                                try:
                                    analysis = generate_universal_caption(data_url, filename)
                                    print(f"DEBUG: AI analysis result: {analysis}")
                                    
                                    if 'error' in analysis:
                                        print(f"DEBUG: AI analysis failed for {filename}: {analysis['error']}")
                                        # Provide a fallback summary for image-only PDFs
                                        if "image-only PDF" in analysis['error'] or "Could not extract any text" in analysis['error']:
                                            summary = f"Scanned document: {filename} (requires manual review)"
                                            department = "Unknown"
                                        else:
                                            summary = f"Analysis failed: {analysis['error']}"
                                            department = "Unknown"
                                    else:
                                        summary = analysis.get('summary', 'No summary generated')
                                        department = analysis.get('department', 'Unknown')
                                        
                                    print(f"DEBUG: Final summary: {summary}")
                                    print(f"DEBUG: Final department: {department}")
                                        
                                except Exception as e:
                                    print(f"DEBUG: Exception during AI analysis for {filename}: {e}")
                                    summary = f"Analysis error: {str(e)}"
                                    department = "Unknown"

                                # Prepare storage path and check duplicates
                                storage_path = f"{user_id}/{filename}"
                                if _document_exists(user_id, storage_path):
                                    details.append({
                                        "filename": filename,
                                        "status": "skipped_duplicate"
                                    })
                                    print(f"DEBUG: Skipping duplicate document {storage_path}")
                                    continue

                                # Upload to Supabase Storage using service role key
                                upload_ok, public_url = _upload_to_supabase(storage_path, file_bytes, mime_type)
                                if not upload_ok:
                                    details.append({
                                        "filename": filename,
                                        "status": "upload_failed"
                                    })
                                    print(f"DEBUG: Upload failed for {filename}")
                                    continue

                                # Insert DB row
                                _insert_db_row(user_id, filename, storage_path, mime_type, len(file_bytes), summary, department)

                                imported_count += 1
                                details.append({
                                    "filename": filename,
                                    "status": "imported",
                                    "department": department,
                                    "summary": summary
                                })
                                print(f"DEBUG: Successfully imported {filename}")
                            except Exception as e:
                                print(f"DEBUG: Error processing attachment {filename}: {e}")
                                details.append({
                                    "filename": filename,
                                    "status": "error",
                                    "error": str(e)
                                })
                        elif sub_parts:
                            process_attachments(sub_parts)
                
                process_attachments(parts)

            except HttpError as he:
                details.append({"message_id": m.get('id'), "error": str(he)})
            except Exception as ex:
                details.append({"message_id": m.get('id'), "error": str(ex)})

        print(f"DEBUG: Import completed. Total imported: {imported_count}, Total details: {len(details)}")
        return jsonify({"imported": imported_count, "details": details})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def _upload_to_supabase(path: str, content: bytes, mime: str) -> Tuple[bool, Optional[str]]:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return False, None
    # Upload via storage API
    url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{path}"
    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": mime,
        "x-upsert": "true",
    }
    r = requests.post(url, headers=headers, data=content)
    if r.status_code in (200, 201):
        return True, None
    return False, None


def _insert_db_row(user_id: str, name: str, path: str, mime_type: str, size_bytes: int, ai_summary: str, department: str):
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return False
    url = f"{SUPABASE_URL}/rest/v1/documents"
    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    payload = {
        "user_id": user_id,
        "name": name,
        "path": path,
        "mime_type": mime_type,
        "size_bytes": size_bytes,
        "ai_summary": ai_summary,
        "department": department,
        "is_read": False,
    }
    r = requests.post(url, headers=headers, data=json.dumps(payload))
    return r.status_code in (200, 201)


def _document_exists(user_id: str, storage_path: str) -> bool:
    """Check if a document already exists for this user and storage path."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return False
    url = f"{SUPABASE_URL}/rest/v1/documents"
    params = {
        "user_id": f"eq.{user_id}",
        "path": f"eq.{storage_path}",
        "select": "id",
        "limit": 1,
    }
    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
    }
    try:
        resp = requests.get(url, headers=headers, params=params)
        if resp.status_code != 200:
            print(f"DEBUG: _document_exists query failed: {resp.status_code} {resp.text}")
            return False
        rows = resp.json()
        return isinstance(rows, list) and len(rows) > 0
    except Exception as e:
        print(f"DEBUG: _document_exists exception: {e}")
        return False


# Add this new endpoint for testing
@gmail_bp.route('/test-search', methods=['POST'])
def test_gmail_search():
    """Test endpoint to debug Gmail search without importing"""
    try:
        data = request.get_json(force=True)
        state = data.get('state')
        query = data.get('query', 'has:attachment newer_than:30d')
        
        if not state or state not in _token_store:
            return jsonify({"error": "Missing or invalid state. Authenticate first."}), 400
            
        entry = _token_store[state]
        cred_dict = entry.get('credentials')
        if not cred_dict:
            return jsonify({"error": "Not authorized yet. Complete OAuth flow."}), 400

        creds = Credentials(
            token=cred_dict.get('token'),
            refresh_token=cred_dict.get('refresh_token'),
            token_uri=cred_dict.get('token_uri'),
            client_id=cred_dict.get('client_id'),
            client_secret=cred_dict.get('client_secret'),
            scopes=cred_dict.get('scopes'),
        )

        service = _build_service(creds)
        
        # Test different queries
        test_queries = [
            'has:attachment newer_than:30d',
            'is:unread has:attachment newer_than:30d',
            'is:unread has:attachment',
            'has:attachment',
            'is:unread',
            ''  # All messages
        ]
        
        results = {}
        for test_query in test_queries:
            try:
                resp = service.users().messages().list(userId='me', q=test_query, maxResults=5).execute()
                message_count = len(resp.get('messages', []))
                results[test_query] = {
                    'count': message_count,
                    'messages': resp.get('messages', [])[:2]  # First 2 message IDs
                }
                print(f"DEBUG: Query '{test_query}' found {message_count} messages")
            except Exception as e:
                results[test_query] = {'error': str(e)}
                print(f"DEBUG: Query '{test_query}' failed: {e}")
        
        return jsonify({"results": results})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

