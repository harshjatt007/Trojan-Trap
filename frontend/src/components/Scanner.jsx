import React, { useState } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

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
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

const Scanner = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [report, setReport] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [scanId, setScanId] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage('');
    setReport(null);

    console.log("File selected:", file); // Log the selected file
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
    const { fileName, fileSize, fileHash, scannedAt, isMalicious, threatLevel, matchedHashes } = report;

    return (
      <div className="bg-gray-100 p-4 rounded-md shadow-md">
        <h2 className="text-2xl font-bold mb-4">Scan Report</h2>
        <div className="mb-2">
          <strong>File Name:</strong> {fileName}
        </div>
        <div className="mb-2">
          <strong>File Size:</strong> {fileSize}
        </div>
        <div className="mb-2">
          <strong>File Hash:</strong> <span className="text-gray-600">{fileHash}</span>
        </div>
        <div className="mb-2">
          <strong>Scan Date:</strong> {new Date(scannedAt).toLocaleString()}
        </div>
        <div className="mb-4">
          <strong>Threat Level:</strong> <span className={isMalicious ? "text-red-600 font-bold" : "text-green-600 font-bold"}>{isMalicious ? 'Malicious' : 'Safe'}</span>
        </div>
        {isMalicious && (
          <div>
            <strong>Matched Hashes:</strong>
            <ul className="list-disc ml-6">
              {matchedHashes.map((hash, index) => (
                <li key={index}>{hash}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4">
          <strong>Status:</strong> <span className={isMalicious ? "text-red-600" : "text-green-600"}>{isMalicious ? 'Malicious - Immediate Action Required' : 'Safe - No Threat Detected'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">File Scanner</h1>
      
      <button
        type="button"
        onClick={() => document.getElementById('file-input').click()}
        className="mb-4 p-2 border border-gray-300 rounded-md"
      >
        Upload to Scan
      </button>
      <input
        id="file-input"
        type="file"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="hidden"
      />
      {isUploading && <p>Uploading...</p>}

      {/* Stripe Payment */}
      {clientSecret && !report && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <div className='text-center'>
          <h1 className='text-red-500 font-bold'>100 INR Per Report</h1>
          </div>
          
          <PaymentForm onSuccess={handlePaymentSuccess} onError={setErrorMessage} />
        </Elements>

      {/* Error Message */}
      {errorMessage && (
        <div className="text-red-600 font-semibold mt-4">
          {errorMessage}
        </div>
      )}

      {/* Report */}
      {report && formatReport(report)}
    </div>
  );
};

export default Scanner;
