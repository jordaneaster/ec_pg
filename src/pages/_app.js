import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { AuthProvider } from '../contexts/AuthContext'; // Import AuthProvider
import Nav from '../components/Nav'; // Import Nav component
// import Footer from '../components/Footer'; // Optional: Import Footer if you have one
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  useEffect(() => {
    // Fix for Chromium-based browsers (e.g., Chrome, Edge) navigation issues
    const handleRouteChange = (url) => {
      console.log(`Route changed to: ${url}`);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  return (
    <AuthProvider> {/* Wrap everything in AuthProvider */}
      <Head>
        {/* Add any global head elements here */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>The Program</title> {/* Example default title */}
      </Head>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white"> {/* Basic layout structure */}
        <Nav /> {/* Add Nav component */}
        <main className="flex-grow"> {/* Ensure main content area can grow */}
          <Component {...pageProps} /> {/* Render the current page */}
        </main>
        {/* <Footer /> */} {/* Optional: Add Footer component here */}
      </div>
    </AuthProvider>
  );
}
