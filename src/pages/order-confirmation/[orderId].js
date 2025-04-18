import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId || !user) {
        // Wait for router query and user auth
        if (!authLoading && !user) {
            setError("Please log in to view your order confirmation.");
            setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', user.id) // Ensure user owns the order
          .maybeSingle(); // Use maybeSingle as order might not exist or belong to user

        if (orderError) throw orderError;
        if (!orderData) {
          throw new Error('Order not found or access denied.');
        }
        setOrder(orderData);

        // Fetch associated order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        if (itemsError) throw itemsError;
        setOrderItems(itemsData || []);

      } catch (err) {
        console.error("Error fetching order confirmation:", err);
        setError(err.message || 'Failed to load order details.');
        setOrder(null);
        setOrderItems([]);
      } finally {
        setLoading(false);
      }
    };

    // Only run fetch if orderId is available and auth isn't loading
    if (orderId && !authLoading) {
        fetchOrderDetails();
    } else if (!authLoading && !orderId) {
        // Handle case where orderId is missing from URL somehow
        setError("Invalid order confirmation link.");
        setLoading(false);
    }

  }, [orderId, user, authLoading]); // Depend on orderId, user, and authLoading

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto mb-4" />
        <p className="text-lg text-gray-400">Loading your order confirmation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-red-400">Error Loading Order</h1>
        <p className="text-lg text-gray-400 mb-6">{error}</p>
        <Link href="/account" className="text-indigo-400 hover:text-indigo-300">
          Go to My Account
        </Link>
      </div>
    );
  }

  if (!order) {
    // Should be caught by error state, but as a fallback
    return <div className="container mx-auto px-4 py-12 text-center">Order details not available.</div>;
  }

  return (
    <>
      <Head>
        <title>Order Confirmed - #{order.id.substring(0, 8)}</title>
      </Head>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 text-center mb-8 border border-green-500/30">
          <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Thank You For Your Order!</h1>
          <p className="text-lg text-gray-300 mb-4">Your order has been placed successfully.</p>
          <p className="text-sm text-gray-400">Order ID: <span className="font-mono text-gray-300">{order.id}</span></p>
          <p className="text-sm text-gray-400">Order Date: <span className="text-gray-300">{new Date(order.order_date).toLocaleString()}</span></p>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-8 border border-gray-700/50">
          <h2 className="text-xl font-semibold text-white mb-6 border-b border-gray-700 pb-3">Order Summary</h2>

          {orderItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700/50 last:border-b-0 last:pb-0 last:mb-0">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-700 rounded overflow-hidden relative flex-shrink-0">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.product_name || 'Product Image'} layout="fill" objectFit="cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">No Image</div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-100">{item.product_name || 'Product Item'}</p>
                  <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-100">${(item.price_at_purchase * item.quantity).toFixed(2)}</p>
                <p className="text-sm text-gray-400">(${item.price_at_purchase.toFixed(2)} each)</p>
              </div>
            </div>
          ))}

          <div className="mt-6 pt-4 border-t border-gray-700">
            {/* Add Subtotal, Shipping, Taxes if applicable and stored */}
            <div className="flex justify-between items-center text-lg font-bold text-white">
              <span>Total Paid</span>
              <span>${order.total_amount.toFixed(2)}</span>
            </div>
            <p className="text-sm text-gray-400 text-right mt-1">Paid via {order.payment_method}</p>
          </div>
        </div>

        {/* Add Shipping/Billing Address if stored */}
        {/* <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 mb-8 border border-gray-700/50"> ... </div> */}

        <div className="text-center mt-8">
          <Link href="/shop" className="btn-secondary mr-4">
            Continue Shopping
          </Link>
          <Link href={`/account/${user.id}`} className="btn-primary">
            View My Account
          </Link>
        </div>
      </div>
    </>
  );
}
