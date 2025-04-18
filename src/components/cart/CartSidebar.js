import React from 'react';
import Link from 'next/link'; // Import Link
// ... other imports like useCart, CartItem etc.

export default function CartSidebar({ /* props */ }) {
  // ... existing component logic (hooks, state, cart items calculation)

  return (
    <div className="cart-sidebar">
      {/* ... existing cart items display ... */}

      <div className="mt-auto border-t pt-4">
        {/* ... subtotal display ... */}

        <Link href="/checkout" passHref>
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded mt-4"
            // disabled={cartIsEmpty} // Keep disabled logic if needed
          >
            Proceed to Checkout
          </button>
        </Link>

        {/* ... continue shopping link ... */}
      </div>
    </div>
  );
}
