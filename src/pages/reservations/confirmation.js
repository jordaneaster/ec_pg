import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { FaCheckCircle, FaTicketAlt, FaCalendarAlt, FaQrcode } from 'react-icons/fa';
import { getEventById } from '../../lib/events';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzdoygryvifvcmhhbiaq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ReservationConfirmation() {
  const router = useRouter();
  const { event: eventId, reservation: reservationId } = router.query;
  const [event, setEvent] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!router.isReady) return;
    
    async function loadData() {
      try {
        // Load event data
        if (eventId) {
          const eventData = await getEventById(eventId);
          setEvent(eventData);
        }
        
        // Load reservation data if a reservation ID is provided
        if (reservationId) {
          const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('id', reservationId)
            .single();
            
          if (error) {
            console.error('Error fetching reservation:', error);
            setError("Couldn't find your reservation. Please check your confirmation link.");
          } else if (data) {
            console.log("Retrieved reservation:", data);
            setReservation(data);
          } else {
            setError("Reservation not found");
          }
        } else {
          setError("No reservation ID provided");
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError("Failed to load confirmation details");
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [router.isReady, eventId, reservationId]);
  
  // Generate a random confirmation code if no reservation ID is provided
  const confirmationCode = reservationId || `PGE-${Math.floor(100000 + Math.random() * 900000)}`;
  
  if (loading) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-container">
          <div className="loading-container">
            <div className="loader-spinner"></div>
            <p>Loading confirmation details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Reservation Confirmed | PGE</title>
        <meta name="description" content="Your reservation has been confirmed" />
      </Head>
      
      <div className="confirmation-page">
        <div className="confirmation-container">
          <div className="confirmation-card">
            <div className="confirmation-header">
              <FaCheckCircle className="confirmation-icon" />
              <h1 className="confirmation-title">Reservation Confirmed!</h1>
            </div>
            
            <div className="confirmation-details">
              <p className="confirmation-message">
                Thank you for your reservation. We've sent {reservation?.alert === 'sms' ? 'a text message' : 'an email'} with all the details.
              </p>
              
              {/* QR Code Display */}
              {reservation?.qr_code_url && (
                <div className="qr-code-container">
                  <h3 className="qr-code-title"><FaQrcode className="qr-icon" /> Your Event Pass</h3>
                  <div className="qr-code-image">
                    <Image 
                      src={reservation.qr_code_url}
                      alt="Event QR Code"
                      width={200}
                      height={200}
                      className="qr-code"
                      priority
                    />
                    <p className="qr-code-note">Present this QR code at the event entrance</p>
                  </div>
                </div>
              )}
              
              <div className="confirmation-info">
                <div className="info-item">
                  <div className="info-label">Confirmation Code:</div>
                  <div className="info-value confirmation-code">{confirmationCode}</div>
                </div>
                
                {reservation && (
                  <>
                    <div className="info-item">
                      <div className="info-label">Name:</div>
                      <div className="info-value">{reservation.full_name}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Tickets:</div>
                      <div className="info-value">{reservation.num_tickets} x {reservation.ticket_type}</div>
                    </div>
                  </>
                )}
                
                {event && (
                  <>
                    <div className="info-item">
                      <div className="info-label">Event:</div>
                      <div className="info-value">{event.title}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Date & Time:</div>
                      <div className="info-value">
                        {new Date(event.event_date).toLocaleString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Location:</div>
                      <div className="info-value">{event.location}</div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="next-steps">
                <h3 className="next-steps-title">Next Steps:</h3>
                <ul className="steps-list">
                  <li className="step-item">
                    <FaTicketAlt className="step-icon" />
                    <span>
                      {reservation?.alert === 'sms' 
                        ? 'Check your text messages for your e-ticket' 
                        : 'Check your email for your e-ticket'}
                    </span>
                  </li>
                  <li className="step-item">
                    <FaCalendarAlt className="step-icon" />
                    <span>Add this event to your calendar</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="confirmation-actions">
              <Link href="/events" className="action-button primary-button">
                Browse More Events
              </Link>
              <Link href="/" className="action-button secondary-button">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .confirmation-page {
          padding: 2rem 1rem;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .confirmation-container {
          background: var(--color-background-card);
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .confirmation-card {
          text-align: center;
        }
        
        .confirmation-header {
          margin-bottom: 2rem;
        }
        
        .confirmation-icon {
          color: #10b981;
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .confirmation-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }
        
        .confirmation-message {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          color: var(--color-text-secondary);
        }
        
        .confirmation-info {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          text-align: left;
        }
        
        .info-item {
          display: flex;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .info-item:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }
        
        .info-label {
          font-weight: 600;
          width: 150px;
          flex-shrink: 0;
        }
        
        .confirmation-code {
          font-weight: 700;
          font-family: monospace;
          letter-spacing: 1px;
          color: var(--color-primary);
        }
        
        .next-steps {
          text-align: left;
          margin-bottom: 2rem;
        }
        
        .next-steps-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        
        .steps-list {
          list-style: none;
          padding: 0;
        }
        
        .step-item {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .step-icon {
          color: var(--color-primary);
          margin-right: 0.75rem;
        }
        
        .confirmation-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .action-button {
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .primary-button {
          background-color: var(--color-primary);
          color: white;
        }
        
        .primary-button:hover {
          background-color: var(--color-primary-dark);
        }
        
        .secondary-button {
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--color-text-primary);
        }
        
        .secondary-button:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .loading-container {
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
        
        .qr-code-container {
          text-align: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        
        .qr-code-title {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }
        
        .qr-icon {
          color: var(--color-primary);
          margin-right: 0.5rem;
        }
        
        .qr-code-image {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .qr-code {
          background: white;
          padding: 0.5rem;
          border-radius: 4px;
        }
        
        .qr-code-note {
          margin-top: 0.75rem;
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }
      `}</style>
    </>
  );
}
