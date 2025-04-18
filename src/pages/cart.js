import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { CART_UPDATED_EVENT } from '../components/shop/AddToCartButton';

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCartItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let items = [];
      if (user) {
        const { data, error: dbError } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (dbError) throw dbError;
        items = data || [];
        localStorage.removeItem('cart');
      } else {
        items = JSON.parse(localStorage.getItem('cart') || '[]');
      }
      setCartItems(items);
    } catch (err) {
      setError('Failed to load cart items. Please try again.');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchCartItems();
    }
  }, [user, authLoading, fetchCartItems]);

  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartItems();
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate);
    };
  }, [fetchCartItems]);

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(item);
      return;
    }

    setLoading(true);
    try {
      if (user) {
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
          .eq('id', item.id);

        if (updateError) throw updateError;
      } else {
        const updatedCart = cartItems.map(cartItem =>
          cartItem.product_id === item.product_id ? { ...cartItem, quantity: newQuantity } : cartItem
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      fetchCartItems();
    } catch (err) {
      setError('Failed to update item quantity.');
      setLoading(false);
    }
  };

  const removeItem = async (itemToRemove) => {
    setLoading(true);
    try {
      if (user) {
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemToRemove.id);

        if (deleteError) throw deleteError;
      } else {
        const updatedCart = cartItems.filter(item => item.product_id !== itemToRemove.product_id);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      fetchCartItems();
    } catch (err) {
      setError('Failed to remove item from cart.');
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const subtotal = calculateSubtotal();

  return (
    <>
      <Head>
        <title>Shopping Cart | PGE</title>
        <meta name="description" content="Review items in your shopping cart" />
      </Head>

      <div className="cart-page-container">
        <h1 className="cart-page-title">Shopping Cart</h1>

        {loading || authLoading ? (
          <div className="cart-loading">
            <p>Loading Cart...</p>
          </div>
        ) : error ? (
          <div className="cart-error">
            <p>{error}</p>
            <button onClick={fetchCartItems} className="btn-primary mt-2">
              Retry
            </button>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="cart-empty">
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet.</p>
            <Link href="/shop" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-list">
              <ul>
                {cartItems.map((item) => (
                  <li key={user ? item.id : item.product_id} className="cart-item">
                    <div className="cart-item-image">
                      {item.image_url ? (
                        <Image src={item.image_url} alt={item.product_name} layout="fill" objectFit="cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">No Image</div>
                      )}
                    </div>
                    <div className="cart-item-details">
                      <div>
                        <h3>{item.product_name}</h3>
                        <p className="cart-item-price">Price: ${parseFloat(item.price).toFixed(2)}</p>
                      </div>
                      <div className="cart-item-controls">
                        <div className="cart-item-quantity">
                          <button
                            onClick={() => updateQuantity(item, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            disabled={loading}
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                            aria-label="Increase quantity"
                            disabled={loading}
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="cart-item-remove">
                          <button
                            onClick={() => removeItem(item)}
                            aria-label="Remove item"
                            disabled={loading}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-summary-container">
              <div className="order-summary">
                <h2>Order Summary</h2>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <Link href="/checkout" passHref>
                  <button
                    className="checkout-button"
                    disabled={loading || cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
