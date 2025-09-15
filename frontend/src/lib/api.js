// API service for backend integration
// Prefer env var from Vite at build time; fallback to localhost for dev
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:5000/api';

export const apiService = {
  // Analyze document with AI
  async analyzeDocument(fileData, filename) {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_data: fileData,
          filename: filename
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze document');
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  },

  // Gmail: get OAuth URL
  async getGmailAuthUrl(userId) {
    const url = new URL(`${API_BASE_URL}/gmail/auth-url`);
    url.searchParams.set('user_id', userId);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to get Gmail auth URL');
    return res.json();
  },

  // Gmail: import attachments after OAuth callback
  async importFromGmail(state, { query = 'has:attachment newer_than:30d', maxResults = 25 } = {}) {
    const res = await fetch(`${API_BASE_URL}/gmail/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, query, max_results: maxResults }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gmail import failed');
    }
    return res.json();
  },

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw error;
    }
  }
};

// Utility function to convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

