import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image'; // Import Image for order summary
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm'; // Import the new form component

// Check if the publishable key exists before loading Stripe
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!publishableKey) {
  console.error("ERROR: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Check your .env.local file and restart the server.");
}
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export default function CheckoutPage() {
  const { cartItems, subtotal, loading: cartLoading, error: cartError } = useCart();
  const { user } = useAuth(); // Get user from AuthContext
  const [clientSecret, setClientSecret] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0); // Store amount from server
  const [loadingSecret, setLoadingSecret] = useState(true); // Keep true initially
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    // Only proceed if cart is NOT loading and we don't have a secret yet.
    if (!cartLoading && !clientSecret) {
      // Now check cartItems length *after* confirming cartLoading is false.
      if (cartItems.length > 0) {
        setLoadingSecret(true); // Set loading true specifically for intent fetch
        setFetchError(null);
        fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Pass items to calculate amount securely on the server
          body: JSON.stringify({ items: cartItems }),
        })
          .then((res) => {
              if (!res.ok) {
                  return res.json().then(err => { throw new Error(err.error || `Server error: ${res.status}`) });
              }
              return res.json();
          })
          .then((data) => {
              setClientSecret(data.clientSecret);
              setPaymentAmount(data.amount); // Store amount from server response
              setLoadingSecret(false);
          })
          .catch((error) => {
              console.error("Failed to fetch payment intent:", error);
              setFetchError(error.message || 'Failed to initialize payment. Please try again.');
              setLoadingSecret(false);
          });
      } else {
          // Cart is confirmed empty after loading finished.
          setFetchError("Your cart is empty.");
          setLoadingSecret(false); // Stop loading secret process
      }
    } else if (cartLoading) {
        // If cart is still loading, ensure fetchError related to emptiness is cleared
        // and loadingSecret remains true until cart is loaded.
        setFetchError(null);
        setLoadingSecret(true);
    }
    // If clientSecret already exists, do nothing.

  // Depend on cartLoading primarily. Also include cartItems and clientSecret
  // to re-evaluate if they change, but the main trigger is cartLoading finishing.
  }, [cartLoading, cartItems, clientSecret]);

  const appearance = {
    theme: 'stripe', // or 'night', 'flat'
    // Add other appearance variables if needed
  };
  const options = {
    clientSecret,
    appearance,
  };

  // Add a check early on if stripePromise is null
  if (!stripePromise) {
      return (
          <div className="container mx-auto px-4 py-8 text-center text-red-600">
              <p>Error: Stripe could not be initialized. Please check the configuration.</p>
          </div>
      );
  }

  // Display loading state while cart OR client secret are loading
  // Use loadingSecret specifically for the intent fetching part
  if (cartLoading || loadingSecret) {
      return (
          <div className="container mx-auto px-4 py-8 text-center">
              <p>Loading Checkout...</p>
              {/* Add a spinner here if desired */}
          </div>
      );
  }

  // Display error if cart loading failed OR payment intent fetch failed
  // Ensure fetchError is displayed correctly if cart was empty initially
  if (cartError || fetchError) {
      return (
          <div className="container mx-auto px-4 py-8 text-center text-red-600">
              {/* Prioritize cartError if it exists */}
              <p>Error: {cartError || fetchError}</p>
          </div>
      );
  }

  return (
    <>
      <Head>
        <title>Checkout - My Shop</title>
      </Head>
      <div className="container mx-auto px-4 py-8 checkout-page-container">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Order Summary Section */}
          <div className="w-full lg:w-1/3 order-last lg:order-first checkout-order-summary">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 border-b pb-2">Order Summary</h2>
              {cartItems.map((item) => (
                <div key={user ? item.id : item.product_id} className="flex justify-between items-center mb-3 text-sm checkout-summary-item">
                   <div className="flex items-center">
                        <div className="w-10 h-10 mr-3 relative flex-shrink-0 checkout-summary-image-container">
                             {item.image_url ? (
                                <Image src={item.image_url} alt={item.product_name} layout="fill" objectFit="cover" className="rounded" />
                             ) : (
                                <div className="w-full h-full bg-gray-300 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-500">?</div>
                             )}
                        </div>
                        <span>{item.product_name} (x{item.quantity})</span>
                   </div>
                  <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {/* Add Shipping/Taxes if applicable */}
                <div className="flex justify-between mt-4 text-lg font-bold">
                  <span>Total</span>
                  {/* Display amount from server if available, otherwise fallback to client-side subtotal */}
                  <span>${paymentAmount > 0 ? (paymentAmount / 100).toFixed(2) : subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="w-full lg:w-2/3 checkout-payment-details">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              {/* Ensure stripePromise is checked here */}
              {clientSecret && stripePromise ? (
                <Elements options={options} stripe={stripePromise}>
                  <CheckoutForm clientSecret={clientSecret} amount={paymentAmount} />
                </Elements>
              ) : (
                 // Show a more specific message if stripePromise failed
                 !stripePromise ? <p className="text-red-500">Stripe failed to load.</p> : <p>Initializing payment form...</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
