import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function ReservationsRedirect() {
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);
  
  useEffect(() => {
    // Only redirect once and only when router is ready
    if (router.isReady && !hasRedirected) {
      console.log("ReservationsRedirect - Component mounted");
      console.log("ReservationsRedirect - Path:", router.asPath);
      console.log("ReservationsRedirect - Query:", router.query);
      
      // We're already at /reservations, so we need to redirect to the index
      if (router.pathname === '/reservations' && router.query.event) {
        // We already have an event ID in the query, just mark as redirected and render the page
        console.log("ReservationsRedirect - Already at correct URL, not redirecting");
        setHasRedirected(true);
        // Hard navigation to ensure proper loading
        window.location.href = `/reservations?event=${router.query.event}`;
      } else if (router.isReady) {
        // If there's no event ID, redirect to events page
        console.log("ReservationsRedirect - No event ID, redirecting to events page");
        setHasRedirected(true);
        router.replace('/events');
      }
    }
  }, [router.isReady, router.query, hasRedirected]);
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="loader-spinner" style={{
        border: '4px solid rgba(0, 0, 0, 0.1)',
        borderLeftColor: 'var(--color-primary)',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
      }}></div>
      <p>Loading reservation page...</p>
      
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
