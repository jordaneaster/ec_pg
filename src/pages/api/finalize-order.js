import { supabase } from '../../lib/supabaseClient'; // Use admin client for server-side operations
import { getServiceSupabaseClient } from '../../lib/supabaseAdmin'; // Assuming you have an admin client setup

// Initialize Stripe with the secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { paymentIntentId, userId } = req.body;

  if (!paymentIntentId || !userId) {
    return res.status(400).json({ error: 'Missing paymentIntentId or userId' });
  }

  const supabaseAdmin = getServiceSupabaseClient(); // Use admin client

  try {
    // 1. Verify Payment Intent Status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      console.warn(`PaymentIntent ${paymentIntentId} status is ${paymentIntent.status}, not 'succeeded'.`);
      // Decide if you want to error out or handle other statuses (e.g., processing)
      // For now, we'll only proceed if it succeeded.
      return res.status(400).json({ error: `Payment not successful (status: ${paymentIntent.status})` });
    }

    // Optional: Check if an order for this paymentIntent already exists to prevent duplicates
    const { data: existingOrder, error: existingOrderError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('payment_intent_id', paymentIntentId) // Add a 'payment_intent_id' column to your 'orders' table
      .maybeSingle();

    if (existingOrderError) throw existingOrderError;
    if (existingOrder) {
      console.log(`Order already exists for PaymentIntent ${paymentIntentId}. Order ID: ${existingOrder.id}`);
      // Return existing order ID if you want idempotency
      return res.status(200).json({ orderId: existingOrder.id });
    }


    // 2. Get Cart Items for the User
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('user_id', userId); // Assuming user_id in cart_items matches auth.uid()

    if (cartError) throw cartError;
    if (!cartItems || cartItems.length === 0) {
      // This case might happen if the cart was cleared elsewhere or if there's a race condition.
      // Or if payment succeeded but the cart was empty (should ideally be prevented earlier).
      console.warn(`No cart items found for user ${userId} during order finalization.`);
      return res.status(400).json({ error: 'Cart is empty, cannot create order.' });
    }

    // 3. Calculate Total Amount (server-side for security)
    const calculatedTotal = cartItems.reduce((total, item) => {
        const price = parseFloat(item.price);
        return total + (isNaN(price) ? 0 : price * item.quantity);
    }, 0);

    // Optional: Verify server-calculated total matches Stripe paymentIntent amount
    if (Math.round(calculatedTotal * 100) !== paymentIntent.amount) {
        console.error(`Amount mismatch! Server: ${Math.round(calculatedTotal * 100)}, Stripe: ${paymentIntent.amount}`);
        // Handle mismatch - log, potentially refund, or investigate
        // For now, we'll proceed but log the error. You might want to throw an error here in production.
    }

    // 4. Create Order in 'orders' table
    const orderData = {
      user_id: userId, // Use the user ID passed from the client
      auth_id: userId, // Assuming auth_id is the same as user_id (auth.uid())
      order_date: new Date().toISOString(),
      status: 'completed', // Or 'processing' depending on your flow
      total_amount: calculatedTotal,
      payment_method: paymentIntent.payment_method_types ? paymentIntent.payment_method_types[0] : 'stripe',
      payment_intent_id: paymentIntentId, // Store the payment intent ID
      // Add shipping/billing address if collected and available
      // shipping_address: { ... },
      // billing_address: { ... },
    };

    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;
    if (!newOrder) throw new Error('Failed to create order or retrieve new order data.');

    const orderId = newOrder.id;

    // 5. Create Order Items in 'order_items' table
    const orderItemsData = cartItems.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: parseFloat(item.price), // Ensure correct price is stored
      product_name: item.product_name, // Store denormalized data
      image_url: item.image_url, // Store denormalized data
    }));

    const { error: orderItemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsData);

    if (orderItemsError) {
      // Consider how to handle partial failure (order created, but items failed)
      // Maybe delete the order or log for manual intervention
      console.error(`Failed to insert order items for order ${orderId}:`, orderItemsError);
      throw orderItemsError;
    }

    // 6. Clear User's Cart
    const { error: deleteCartError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (deleteCartError) {
      // Log error but don't necessarily fail the whole process
      console.error(`Failed to clear cart for user ${userId} after order ${orderId}:`, deleteCartError);
    }

    // 7. Return the new Order ID
    res.status(200).json({ orderId: orderId });

  } catch (error) {
    console.error('Error finalizing order:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

// Remember to set up getServiceSupabaseClient() in lib/supabaseAdmin.js
// Example:
/*
// lib/supabaseAdmin.js
import { createClient } from '@supabase/supabase-js';

let supabaseAdmin = null;

export function getServiceSupabaseClient() {
  if (supabaseAdmin) {
    return supabaseAdmin;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase URL or Service Role Key for admin client.');
  }

  supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } } // Important for server-side
  );

  return supabaseAdmin;
}
*/

// Also, add a 'payment_intent_id' text column to your 'orders' table in Supabase.
