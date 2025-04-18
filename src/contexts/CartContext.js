import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

// Define the event name (consistent with AddToCartButton and CartPage)
export const CART_UPDATED_EVENT = 'cartUpdated';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Helper Function to Dispatch Update Event ---
  const dispatchCartUpdate = () => {
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
  };

  // --- Fetch Cart Items ---
  const fetchCartItems = useCallback(async () => {
    if (authLoading) return; // Don't fetch until auth status is known
    setLoading(true);
    setError(null);
    try {
      let items = [];
      if (user) {
        // Logged-in user: Fetch from Supabase
        const { data, error: dbError } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (dbError) throw dbError;
        items = data || [];
        // Optional: Clear local storage cart if user logs in and has DB items
        if (items.length > 0) {
            localStorage.removeItem('cart');
        }
      } else {
        // Guest user: Fetch from localStorage
        items = JSON.parse(localStorage.getItem('cart') || '[]');
      }
      setCartItems(items);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setError('Failed to load cart items.');
      setCartItems([]); // Reset cart on error
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  // --- Initial Fetch and Refetch on Auth Change ---
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]); // fetchCartItems dependency includes user and authLoading

  // --- Add Item to Cart ---
  const addToCart = async (product, quantity = 1) => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        // Logged-in user: Add/Update in Supabase
        const { data: existingItems, error: fetchError } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .maybeSingle(); // Use maybeSingle to handle 0 or 1 result

        if (fetchError) throw fetchError;

        if (existingItems) {
          // Update quantity if item exists
          const newQuantity = existingItems.quantity + quantity;
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
            .eq('id', existingItems.id);
          if (updateError) throw updateError;
        } else {
          // Insert new item if it doesn't exist
          const newItem = {
            user_id: user.id,
            product_id: product.id,
            quantity: quantity,
            price: product.price, // Ensure price is included
            product_name: product.name, // Ensure name is included
            image_url: product.image_url || null // Ensure image_url is included
          };
          const { error: insertError } = await supabase.from('cart_items').insert(newItem);
          if (insertError) throw insertError;
        }
      } else {
        // Guest user: Add/Update in localStorage
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItemIndex = currentCart.findIndex(item => item.product_id === product.id);

        if (existingItemIndex > -1) {
          currentCart[existingItemIndex].quantity += quantity;
        } else {
          currentCart.push({
            // Use a temporary unique ID for local storage items if needed for keys, or rely on product_id
            // id: Date.now(), // Example temporary ID
            product_id: product.id,
            quantity: quantity,
            price: product.price,
            product_name: product.name,
            image_url: product.image_url || null,
            // Add created_at if needed for sorting, though less critical for local storage
            created_at: new Date().toISOString()
          });
        }
        localStorage.setItem('cart', JSON.stringify(currentCart));
      }
      await fetchCartItems(); // Refetch to update state
      dispatchCartUpdate(); // Notify components
    } catch (err) {
      console.error("Add to cart error:", err);
      setError('Failed to add item to cart.');
    } finally {
      setLoading(false);
    }
  };

  // --- Update Item Quantity ---
  const updateQuantity = async (itemIdentifier, newQuantity) => {
     // itemIdentifier can be item.id (for DB) or item.product_id (for local)
    if (newQuantity < 1) {
      await removeItem(itemIdentifier); // Remove if quantity is zero or less
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (user) {
        // Logged-in user: Update in Supabase using item ID
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
          .eq('id', itemIdentifier); // Use the unique DB ID

        if (updateError) throw updateError;
      } else {
        // Guest user: Update in localStorage using product_id
        const updatedCart = cartItems.map(cartItem =>
          cartItem.product_id === itemIdentifier ? { ...cartItem, quantity: newQuantity } : cartItem
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      await fetchCartItems(); // Refetch to update state
      dispatchCartUpdate(); // Notify components
    } catch (err) {
      console.error("Update quantity error:", err);
      setError('Failed to update item quantity.');
    } finally {
      setLoading(false);
    }
  };

  // --- Remove Item from Cart ---
  const removeItem = async (itemIdentifier) => {
    // itemIdentifier can be item.id (for DB) or item.product_id (for local)
    setLoading(true);
    setError(null);
    try {
      if (user) {
        // Logged-in user: Delete from Supabase using item ID
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemIdentifier); // Use the unique DB ID

        if (deleteError) throw deleteError;
      } else {
        // Guest user: Filter out from localStorage using product_id
        const updatedCart = cartItems.filter(item => item.product_id !== itemIdentifier);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
      await fetchCartItems(); // Refetch to update state
      dispatchCartUpdate(); // Notify components
    } catch (err) {
      console.error("Remove item error:", err);
      setError('Failed to remove item from cart.');
    } finally {
      setLoading(false);
    }
  };

  // --- Clear Cart ---
  const clearCart = async () => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        // Logged-in user: Delete all items for this user from Supabase
        const { error: deleteError } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;
      } else {
        // Guest user: Remove from localStorage
        localStorage.removeItem('cart');
      }
      setCartItems([]); // Immediately clear local state
      dispatchCartUpdate(); // Notify components
    } catch (err) {
      console.error("Clear cart error:", err);
      setError('Failed to clear cart.');
    } finally {
      setLoading(false);
    }
  };

  // --- Calculate Subtotal ---
  const calculateSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
        const price = parseFloat(item.price);
        return total + (isNaN(price) ? 0 : price * item.quantity);
    }, 0);
  }, [cartItems]);

  const subtotal = calculateSubtotal();

  // --- Context Value ---
  const value = {
    cartItems,
    loading,
    error,
    fetchCartItems,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    itemCount: cartItems.reduce((count, item) => count + item.quantity, 0) // Total number of items
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
