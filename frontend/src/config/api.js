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
  try {
    console.log('Starting file upload to:', API_ENDPOINTS.UPLOAD_FILE);
    console.log('File details:', { name: file.name, size: file.size, type: file.type });
    
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(API_ENDPOINTS.UPLOAD_FILE, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header for FormData, let the browser set it
    });

    console.log('Upload response status:', response.status);
    console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload failed with status:', response.status, 'Error:', errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Upload successful:', result);
    return result;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
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

// Comprehensive backend test
export const testBackendConnection = async () => {
  console.log('Testing backend connection...');
  console.log('API Base URL:', API_BASE_URL);
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch(API_ENDPOINTS.HEALTH_CHECK);
    console.log('Health response:', healthResponse.status, healthResponse.ok);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health data:', healthData);
    }
    
    // Test upload endpoint with OPTIONS request
    console.log('Testing upload endpoint with OPTIONS...');
    const optionsResponse = await fetch(API_ENDPOINTS.UPLOAD_FILE, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      }
    });
    console.log('OPTIONS response:', optionsResponse.status, optionsResponse.ok);
    console.log('CORS headers:', {
      'access-control-allow-origin': optionsResponse.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': optionsResponse.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': optionsResponse.headers.get('access-control-allow-headers')
    });
    
    return {
      health: healthResponse.ok,
      cors: optionsResponse.ok,
      apiUrl: API_BASE_URL
    };
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return {
      health: false,
      cors: false,
      error: error.message,
      apiUrl: API_BASE_URL
    };
  }
}; 