import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to get user ID
import { useRouter } from 'next/router'; // Import useRouter for redirection

export default function CheckoutForm({ clientSecret, amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth(); // Get user object
  const router = useRouter(); // Get router instance

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !user) {
      console.log("Stripe.js, elements, or user not loaded yet.");
      setMessage("Initialization error. Please refresh and try again.");
      return;
    }

    setIsLoading(true);
    setMessage(null);

    // --- Step 1: Confirm Payment with Stripe ---
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation/error`, // Redirect here on failure/interruption
      },
      redirect: 'if_required' // Handle success inline if no redirect needed
    });

    if (confirmError) {
      if (confirmError.type === "card_error" || confirmError.type === "validation_error") {
        setMessage(confirmError.message);
      } else {
        setMessage("An unexpected error occurred during payment confirmation.");
      }
      setIsLoading(false);
      return; // Stop processing on confirmation error
    }

    // --- Step 2: Handle Payment Intent Status (Inline Success) ---
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      console.log("Payment Succeeded Inline. PaymentIntent ID:", paymentIntent.id);
      setMessage("Payment successful! Finalizing your order..."); // Update message

      try {
        // --- Step 3: Call API to Finalize Order ---
        const response = await fetch('/api/finalize-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            userId: user.id // Pass the authenticated user's ID
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to finalize order.');
        }

        const orderId = result.orderId;
        console.log("Order finalized successfully. Order ID:", orderId);

        // --- Step 4: Redirect to Confirmation Page ---
        router.push(`/order-confirmation/${orderId}`);

      } catch (finalizeError) {
        console.error("Error calling finalize-order API:", finalizeError);
        setMessage(`Payment succeeded, but failed to finalize order: ${finalizeError.message}. Please contact support.`);
        setIsLoading(false);
      }

    } else if (paymentIntent && paymentIntent.status === 'processing') {
        setMessage("Payment processing. We'll update you when payment is received.");
        setIsLoading(false);
    } else if (paymentIntent) {
        setMessage(`Payment status: ${paymentIntent.status}. Please follow any further instructions.`);
        setIsLoading(false);
    } else {
        setMessage("Payment processing or requires further action. Redirecting...");
    }
  };

  const paymentElementOptions = {
    layout: "tabs"
  }

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <button
        disabled={isLoading || !stripe || !elements || !clientSecret || !user} // Also disable if user not loaded
        id="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span id="button-text">
          {isLoading ? <div className="spinner" id="spinner"></div> : `Pay $${(amount / 100).toFixed(2)}`}
        </span>
      </button>
      {message && <div id="payment-message" className={`mt-4 text-sm ${message.includes('succeed') ? 'text-green-600' : 'text-red-600'}`}>{message}</div>}
      {/* Spinner CSS */}
      <style jsx>{`
        .spinner,
        .spinner:before,
        .spinner:after {
          border-radius: 50%;
        }
        .spinner {
          color: #ffffff;
          font-size: 22px;
          text-indent: -99999em;
          margin: 0px auto;
          position: relative;
          width: 20px;
          height: 20px;
          box-shadow: inset 0 0 0 2px;
          transform: translateZ(0);
        }
        .spinner:before,
        .spinner:after {
          position: absolute;
          content: '';
        }
        .spinner:before {
          width: 10.4px;
          height: 20.4px;
          background: #4f46e5; /* Button background */
          border-radius: 20.4px 0 0 20.4px;
          top: -0.2px;
          left: -0.2px;
          transform-origin: 10.4px 10.2px;
          animation: loading 2s infinite ease 1.5s;
        }
        .spinner:after {
          width: 10.4px;
          height: 10.2px;
          background: #4f46e5; /* Button background */
          border-radius: 0 10.2px 10.2px 0;
          top: -0.1px;
          left: 10.2px;
          transform-origin: 0px 10.2px;
          animation: loading 2s infinite ease;
        }
        @keyframes loading {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </form>
  );
}
