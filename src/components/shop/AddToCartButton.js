import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

// Custom event for cart updates
const CART_UPDATED_EVENT = 'cart-updated';

export default function AddToCartButton({ product, quantity = 1, className = '' }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  // For debugging - log props on mount
  useEffect(() => {
    console.log('AddToCartButton props:', { product, quantity });
  }, [product, quantity]);

  const broadcastCartUpdate = () => {
    // Dispatch custom event that cart has been updated
    const event = new CustomEvent(CART_UPDATED_EVENT, { 
      detail: { timestamp: new Date().getTime() } 
    });
    window.dispatchEvent(event);
  };

  const addToCart = async () => {
    console.log('Add to cart clicked:', { product, quantity });
    
    if (!product || !product.id) {
      console.error('Invalid product data:', product);
      setError('Invalid product data');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (product.out_of_stock) {
      setError('Product is out of stock');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      if (!user) {
        console.log('Adding to cart for non-authenticated user');
        // Store in local storage for non-authenticated users
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if product already exists in cart
        const existingItemIndex = cart.findIndex(item => item.product_id === product.id);
        
        if (existingItemIndex >= 0) {
          // Update quantity if product already in cart
          console.log('Updating existing item in cart');
          cart[existingItemIndex].quantity += quantity;
        } else {
          // Add new item to cart
          console.log('Adding new item to cart');
          cart.push({
            product_id: product.id,
            product_name: product.name,
            price: product.price,
            image_url: product.image_url,
            quantity: quantity,
            added_at: new Date().toISOString()
          });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Cart updated in localStorage:', cart);
        setSuccess(true);
        broadcastCartUpdate();
        setTimeout(() => setSuccess(false), 2000);
      } else {
        console.log('Adding to cart for authenticated user:', user.id);
        // For authenticated users, store in database
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Error checking cart item:', error);
          throw error;
        }
        
        if (data) {
          // Update quantity if product already in cart
          console.log('Updating existing item in database:', data);
          const { error: updateError } = await supabase
            .from('cart_items')
            .update({ 
              quantity: data.quantity + quantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.id);
            
          if (updateError) {
            console.error('Error updating cart item:', updateError);
            throw updateError;
          }
        } else {
          // Add new item to cart
          console.log('Adding new item to database');
          const { error: insertError } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: product.id,
              product_name: product.name,
              price: product.price,
              image_url: product.image_url,
              quantity: quantity
            });
            
          if (insertError) {
            console.error('Error inserting cart item:', insertError);
            throw insertError;
          }
        }
        
        console.log('Cart updated in database successfully');
        setSuccess(true);
        broadcastCartUpdate();
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message || 'Failed to add item to cart');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={addToCart}
      disabled={loading || product.out_of_stock}
      className={`flex items-center justify-center ${className} ${
        loading ? 'opacity-70 cursor-not-allowed' : 
        success ? 'bg-green-600 hover:bg-green-700' :
        error ? 'bg-red-600 hover:bg-red-700' :
        product.out_of_stock ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? (
        <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      
      {success ? 'Added to Cart' : 
       error ? 'Error' : 
       product.out_of_stock ? 'Out of Stock' : 'Add to Cart'}
    </button>
  );
}

// Export the event name to be used by other components
export { CART_UPDATED_EVENT };
