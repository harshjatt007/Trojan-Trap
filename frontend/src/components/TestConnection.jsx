import { useState } from 'react';
import { testBackendConnection, uploadFile } from '../config/api';

const TestConnection = () => {
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const runTest = async () => {
    setIsTesting(true);
    try {
      const result = await testBackendConnection();
      setTestResult(result);
      console.log('Test result:', result);
    } catch (error) {
      setTestResult({ error: error.message });
      console.error('Test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const testUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    try {
      const result = await uploadFile(selectedFile);
      setUploadResult(result);
      console.log('Upload test result:', result);
    } catch (error) {
      setUploadResult({ error: error.message });
      console.error('Upload test failed:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Backend Connection Test</h2>
      
      <div className="mb-6">
        <button
          onClick={runTest}
          disabled={isTesting}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isTesting ? 'Testing...' : 'Test Backend Connection'}
        </button>
      </div>

      {testResult && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Test File Upload:</h3>
        <input
          type="file"
          onChange={handleFileSelect}
          className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <button
          onClick={testUpload}
          disabled={!selectedFile}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Upload
        </button>
      </div>

      {uploadResult && (
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Upload Test Results:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(uploadResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestConnection; 