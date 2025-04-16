import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaArrowLeft } from 'react-icons/fa';
import { getEventById } from '../../lib/events';
import ReservationForm from '../../components/reservations/ReservationForm';

// Use getServerSideProps instead of client-side data fetching
export async function getServerSideProps(context) {
  const { event: eventId } = context.query;
  
  // If no event ID is provided, redirect to events page
  if (!eventId) {
    return {
      redirect: {
        destination: '/events',
        permanent: false,
      },
    };
  }
  
  try {
    const eventData = await getEventById(eventId);
    
    if (!eventData) {
      return {
        props: {
          error: 'Event not found',
          event: null,
        }
      };
    }
    
    return {
      props: {
        event: eventData,
        error: null,
      },
    };
  } catch (err) {
    console.error('Failed to load event:', err);
    return {
      props: {
        event: null,
        error: 'Failed to load event details. Please try again.',
      },
    };
  }
}

export default function ReservationsPage({ event, error }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <>
      <Head>
        <title>{event ? `Reserve - ${event.title}` : 'Event Reservation'} | PGE</title>
        <meta name="description" content="Reserve your spot for upcoming events" />
      </Head>
      
      <div className="reservation-page">
        <div className="reservation-container">
          <Link href="/events" className="back-link">
            <span className="back-link-arrow"><FaArrowLeft /></span> 
            Back to Events
          </Link>
          
          <h1 className="page-title">Event Reservation</h1>
          
          {loading ? (
            <div className="loading-container">
              <div className="loader-spinner"></div>
              <p>Loading event details...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <Link href="/events" className="return-link">
                Browse Available Events
              </Link>
            </div>
          ) : (
            <div className="reservation-content">
              <div className="event-summary">
                <div className="event-image-container">
                  <Image
                    src={event.image_url || '/placeholder-event.jpg'}
                    alt={event.title}
                    width={300}
                    height={200}
                    className="event-image"
                  />
                </div>
                
                <div className="event-details">
                  <h2 className="event-title">{event.title}</h2>
                  
                  <div className="event-meta">
                    <div className="meta-item">
                      <FaCalendarAlt className="meta-icon" />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    
                    <div className="meta-item">
                      <FaClock className="meta-icon" />
                      <span>{formatTime(event.event_date)}</span>
                    </div>
                    
                    <div className="meta-item">
                      <FaMapMarkerAlt className="meta-icon" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="reservation-form-container">
                <h3 className="section-title">Reserve Your Spot</h3>
                <ReservationForm event={event} />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .reservation-page {
          padding: 2rem 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .reservation-container {
          background: var(--color-background-card);
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .back-link {
          display: inline-flex;
          align-items: center;
          color: var(--color-text-secondary);
          margin-bottom: 1.5rem;
          transition: color 0.2s;
        }
        
        .back-link:hover {
          color: var(--color-primary);
        }
        
        .back-link-arrow {
          margin-right: 0.5rem;
        }
        
        .page-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 2rem;
          color: var(--color-text-primary);
        }
        
        .loading-container, .error-container {
          text-align: center;
          padding: 3rem 0;
        }
        
        .loader-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: var(--color-primary);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .error-message {
          color: #e53e3e;
          margin-bottom: 1rem;
        }
        
        .return-link {
          display: inline-block;
          padding: 0.5rem 1rem;
          background-color: var(--color-primary);
          color: white;
          border-radius: 4px;
          font-weight: 500;
        }
        
        .reservation-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        
        @media (min-width: 768px) {
          .reservation-content {
            grid-template-columns: 1fr 2fr;
          }
        }
        
        .event-summary {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .event-image-container {
          position: relative;
          width: 100%;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .event-image {
          width: 100%;
          height: auto;
          object-fit: cover;
        }
        
        .event-details {
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        
        .event-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .event-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .meta-icon {
          color: var(--color-primary);
        }
        
        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--color-primary);
        }
      `}</style>
    </>
  );
}
