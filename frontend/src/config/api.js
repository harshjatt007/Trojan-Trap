// API Configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// API endpoints
export const API_ENDPOINTS = {
  UPLOAD_FILE: `${API_BASE_URL}/upload`,
  SCAN_FILE: `${API_BASE_URL}/scan`,
  VERIFY_PAYMENT: `${API_BASE_URL}/verify-payment`,
  GET_REPORT: `${API_BASE_URL}/report`,
  HEALTH_CHECK: `${API_BASE_URL}/health`,
};

// API utility functions
export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// File upload utility
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(API_ENDPOINTS.UPLOAD_FILE, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  return await response.json();
};

// Health check
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.HEALTH_CHECK);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}; 