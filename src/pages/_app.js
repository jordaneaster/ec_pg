import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext'; // Import CartProvider
import Nav from '../components/Nav';
import Layout from '../components/Layout'; // Assuming you have a Layout component
import '../styles/globals.css';
import '../styles/auth.css';
import '../styles/account.css';
import '../styles/reservations.css';
import '../styles/cart.css';
import '../styles/checkout.css'; // Import the new checkout CSS file

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    const handleRouteChange = (url) => {
      console.log(`Route changed to: ${url}`);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  return (
    <AuthProvider>
      <CartProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>The Program</title>
        </Head>
          <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <Nav />
            <main className="flex-grow">
              <Component {...pageProps} />
            </main>
          </div>
      </CartProvider>
    </AuthProvider>
  );
}
