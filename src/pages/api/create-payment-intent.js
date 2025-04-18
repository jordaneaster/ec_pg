// Add a check for the environment variable first
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Stripe Secret Key not found. Make sure STRIPE_SECRET_KEY is set in your environment variables.');
}

// Initialize Stripe with the secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Helper function to calculate order amount (replace with your actual logic)
// This is a placeholder - you MUST calculate the amount securely on the server
// based on the items being purchased, potentially fetching prices from your DB.
// Passing the amount directly from the client is insecure.
const calculateOrderAmount = (items) => {
  // Replace this logic with a secure calculation based on item IDs and DB prices
  console.warn("WARNING: Using placeholder amount calculation. Implement secure server-side calculation.");
  // Example: Calculate based on items passed in request body
  let total = 0;
  if (items && Array.isArray(items)) {
      items.forEach(item => {
          const price = parseFloat(item.price || 0);
          const quantity = parseInt(item.quantity || 0);
          if (!isNaN(price) && !isNaN(quantity)) {
              total += price * quantity;
          }
      });
  } else {
      // Fallback or error if items aren't provided correctly
      throw new Error("Invalid items data for amount calculation.");
  }
  // Stripe expects amount in the smallest currency unit (e.g., cents)
  return Math.round(total * 100);
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Extract items from request body to calculate amount securely
      const { items } = req.body;

      if (!items) {
          return res.status(400).json({ error: 'Missing items data in request body.' });
      }

      // Calculate the order amount on the server to prevent manipulation
      const amount = calculateOrderAmount(items);

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd', // Change currency if needed
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter
        // is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
        // You might want to add metadata like user ID or order ID here
        // metadata: { userId: '...', orderId: '...' }
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
        amount: amount // Optionally send amount back for confirmation/display
      });
    } catch (error) {
      // Log the specific error on the server for better debugging
      console.error("API Route Error in create-payment-intent:", error);
      // Send a generic error message to the client
      res.status(500).json({ error: 'Internal Server Error creating payment intent.' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
