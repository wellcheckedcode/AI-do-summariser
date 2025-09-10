// API service for backend integration
const API_BASE_URL = 'http://localhost:5000/api';

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

