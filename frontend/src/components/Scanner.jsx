import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CloudUpload, AlertCircle, CheckCircle, FileText, Clock } from 'lucide-react';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ clientSecret, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      });

      if (error) {
        onError(error.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      onError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Complete Payment to View Report</h2>
      <p className="text-center mb-6 text-gray-600">Secure payment via Stripe</p>
      <form onSubmit={handleSubmit}>
        <PaymentElement className="mb-6" />
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-md transition-all duration-300 font-medium"
        >
          {isProcessing ? 'Processing...' : 'Pay ₹100 to View Report'}
        </button>
      </form>
    </div>
  );
};

const Scanner = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [report, setReport] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [scanId, setScanId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);
    setErrorMessage('');
    setReport(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/scan-file`, formData);

      if (response.data.clientSecret && response.data.paymentIntentId) {
        setClientSecret(response.data.clientSecret);
        setPaymentIntentId(response.data.paymentIntentId);
        setScanId(response.data.scanId);
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Upload failed. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/verify-payment`, {
        paymentIntentId: paymentIntentId,
        scanId: scanId,
      });
      setReport(response.data.report);
    } catch (error) {
      setErrorMessage('Failed to fetch report. Contact support.');
    }
  };

  const formatReport = (report) => {
    const { fileName, fileSize, fileHash, scannedAt, isMalicious, details } = report;

    return (
      <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Scan Report</h2>
          <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${isMalicious ? 'bg-red-500' : 'bg-green-500'}`}>
            {isMalicious ? 'Malicious' : 'Safe'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-500" />
              <span className="font-medium">File Name:</span>
              <span className="ml-2 text-gray-600">{fileName}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-500" />
              <span className="font-medium">Scan Date:</span>
              <span className="ml-2 text-gray-600">{new Date(scannedAt).toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <span className="font-medium">File Size:</span>
              <span className="ml-2 text-gray-600">{fileSize}</span>
            </div>
            <div>
              <span className="font-medium">SHA-256 Hash:</span>
              <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">{fileHash}</div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-bold text-lg mb-2">Analysis Result</h3>
          <div className={`flex items-start p-4 rounded-md ${isMalicious ? 'bg-red-50' : 'bg-green-50'}`}>
            {isMalicious ? (
              <AlertCircle className="w-6 h-6 mr-3 text-red-500 flex-shrink-0 mt-1" />
            ) : (
              <CheckCircle className="w-6 h-6 mr-3 text-green-500 flex-shrink-0 mt-1" />
            )}
            <div>
              <p className="font-medium">{details.description}</p>
              <p className="mt-2 text-sm text-gray-600">{details.recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">File Scanner</h1>
      
      {!selectedFile && !isUploading && !clientSecret && !report && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <CloudUpload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-lg mb-6 text-gray-600">Drag and drop your file here or click to browse</p>
          <label className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-md cursor-pointer transition-all duration-300 inline-block font-medium">
            Select File
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
      
      {selectedFile && !report && !clientSecret && (
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <p className="font-medium mb-2">Selected File:</p>
          <p className="text-gray-600 mb-4">{selectedFile.name}</p>
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="loader-circle mb-4"></div>
              <p>Uploading and analyzing file...</p>
            </div>
          ) : (
            <p className="text-green-600 font-medium">File uploaded successfully!</p>
          )}
        </div>
      )}

      {/* Stripe Payment */}
      {clientSecret && !report && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm 
            clientSecret={clientSecret} 
            onSuccess={handlePaymentSuccess} 
            onError={setErrorMessage} 
          />
        </Elements>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-6">
          <p className="font-medium">Error</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Report */}
      {report && formatReport(report)}
    </div>
  );
};

export default Scanner;

