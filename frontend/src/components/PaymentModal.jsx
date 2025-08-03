import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Shield, AlertTriangle } from 'lucide-react';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ paymentIntent, onSuccess, onCancel }) => {
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

    const { error: submitError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
      paymentIntent.clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      }
    );

    if (submitError) {
      setError(submitError.message);
      setIsProcessing(false);
    } else {
      if (confirmedPaymentIntent.status === 'succeeded') {
        onSuccess(confirmedPaymentIntent);
      } else {
        setError('Payment failed. Please try again.');
        setIsProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Premium Scan Payment</h3>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Secure Payment</span>
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

const PaymentModal = ({ isOpen, onClose, paymentIntent, onPaymentSuccess }) => {
  if (!isOpen || !paymentIntent) return null;

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
          <Elements stripe={stripePromise}>
            <PaymentForm
              paymentIntent={paymentIntent}
              onSuccess={onPaymentSuccess}
              onCancel={onClose}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 