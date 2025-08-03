import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Shield, AlertTriangle, Smartphone, QrCode, Copy, Check } from 'lucide-react';
import { createUpiPayment, verifyUpiPayment } from '../config/api';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CardPaymentForm = ({ paymentIntent, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Always simulate successful payment in test mode
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockConfirmedPayment = {
        id: paymentIntent.paymentIntentId || "pi_" + Math.random().toString(36).substr(2, 9),
        status: 'succeeded',
        amount: paymentIntent.amount * 100,
        currency: paymentIntent.currency
      };
      
      onSuccess(mockConfirmedPayment);
    } catch (error) {
      setError('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Card Payment</h3>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Secure</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold">₹{paymentIntent.amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Currency:</span>
            <span className="font-semibold">{paymentIntent.currency.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-md p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        {/* Removed test card info for production */}
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-600 text-sm">{error}</span>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              <span>Pay ₹{paymentIntent.amount}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const UpiPaymentForm = ({ fileData, onSuccess, onCancel }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const upiId = "abhishekchoudhary236@okaxis";
  const amount = 1;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyPayment = async () => {
    setIsVerifying(true);
    setError(null);
    
    try {
      // Simulate payment verification (always succeeds in test mode)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockPaymentResult = {
        id: "upi_" + Math.random().toString(36).substr(2, 9),
        status: "succeeded",
        amount: amount * 100,
        currency: "inr"
      };
      
      onSuccess(mockPaymentResult);
    } catch (error) {
      setError("Payment verification failed. Please try again.");
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">UPI Payment</h3>
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Secure</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold">₹{amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Currency:</span>
            <span className="font-semibold">INR</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <h4 className="font-medium text-gray-700 mb-2">Pay using UPI</h4>
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6">
            <QrCode className="h-32 w-32 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 mb-2">Scan QR code with any UPI app</p>
            <p className="text-xs text-gray-400">Or use UPI ID below</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            UPI ID
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono">
              {upiId}
            </div>
            <button
              type="button"
              onClick={handleCopyUpiId}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            <strong>Test Mode:</strong> Click "Verify Payment" to simulate successful payment and continue with scan.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-600 text-sm">{error}</span>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isVerifying}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleVerifyPayment}
          disabled={isVerifying}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isVerifying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <Smartphone className="h-4 w-4" />
              <span>Verify Payment</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, paymentIntent, fileData, onPaymentSuccess }) => {
  const [activeTab, setActiveTab] = useState('card');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {/* Payment Method Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('card')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'card'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CreditCard className="h-4 w-4 inline mr-2" />
              Card
            </button>
            <button
              onClick={() => setActiveTab('upi')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'upi'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Smartphone className="h-4 w-4 inline mr-2" />
              UPI
            </button>
          </div>

          {/* Payment Forms */}
          {activeTab === 'card' && paymentIntent && (
            <Elements stripe={stripePromise}>
              <CardPaymentForm
                paymentIntent={paymentIntent}
                onSuccess={onPaymentSuccess}
                onCancel={onClose}
              />
            </Elements>
          )}
          
          {activeTab === 'upi' && fileData && (
            <UpiPaymentForm
              fileData={fileData}
              onSuccess={onPaymentSuccess}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 