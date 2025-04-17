import React from 'react';
import { useRouter } from 'next/router'; // Import useRouter
import Image from 'next/image';
import Link from 'next/link';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTicketAlt, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import { getAllEvents, getEventById } from '../../lib/events';

export async function getStaticPaths() {
  const events = await getAllEvents();
  
  const paths = events.map((event) => ({
    params: { id: event.id.toString() },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const event = await getEventById(params.id);
  
  if (!event) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      event,
    },
    revalidate: 60, // Revalidate every minute
  };
}

export default function EventDetails({ event }) {
  const router = useRouter();

  // Use direct navigation to avoid Next.js router issues
  const handleReserveClick = (e) => {
    e.preventDefault();
    console.log("Reserve button clicked, using direct navigation");
    // Direct browser navigation instead of Next.js routing
    window.location.href = `/reservations?event=${event.id}`;
  };

  if (router.isFallback) {
    return (
      <div className="album-detail-page">
        <div className="album-detail-container">
          <div className="page-loader">
            <div className="loader-spinner"></div>
            <p>Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="album-detail-page">
        <div className="album-detail-container">
          <div className="page-error">
            <div>
              <h1 className="text-2xl font-bold mb-4">Error</h1>
              <p>Event not found</p>
              <Link href="/events" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
                Back to Events
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.event_date);
  const now = new Date();
  const isPastEvent = eventDate < now;
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="album-detail-page">
      <div className="album-detail-container">
        <Link href="/events" className="back-link">
          <span className="back-link-arrow"><FaArrowLeft /></span> 
          Back to Events
        </Link>
        
        <div className="album-detail-card">
          <div className="album-detail-content">
            {/* LEFT COLUMN - Event Image */}
            <div className="album-cover-column">
              <div className="album-cover-container">
                <Image
                  src={event.image_url || '/placeholder-event.jpg'}
                  alt={event.title}
                  fill
                  priority
                  className="album-cover-image"
                  sizes="(max-width: 768px) 256px, 288px"
                />
                
                {isPastEvent && (
                  <div className="featured-badge" style={{ backgroundColor: "#ef4444" }}>
                    Past Event
                  </div>
                )}
                
                {event.is_featured && !isPastEvent && (
                  <div className="featured-badge">
                    Featured
                  </div>
                )}
              </div>
            </div>
            
            {/* RIGHT COLUMN - Event Details */}
            <div className="album-details-column">
              <h1 className="album-title">{event.title}</h1>
              
              {/* Date, Time & Location */}
              <div className="album-meta-grid">
                <div className="album-meta-item">
                  <div className="meta-icon-container">
                    <FaCalendarAlt className="meta-icon" />
                  </div>
                  <div>
                    <p className="meta-label">Date</p>
                    <p className="meta-value">{formatDate(eventDate)}</p>
                  </div>
                </div>
                
                <div className="album-meta-item">
                  <div className="meta-icon-container">
                    <FaClock className="meta-icon" />
                  </div>
                  <div>
                    <p className="meta-label">Time</p>
                    <p className="meta-value">{formatTime(eventDate)}</p>
                  </div>
                </div>
                
                <div className="album-meta-item">
                  <div className="meta-icon-container">
                    <FaMapMarkerAlt className="meta-icon" />
                  </div>
                  <div>
                    <p className="meta-label">Location</p>
                    <p className="meta-value">{event.location}</p>
                  </div>
                </div>
              </div>
              
              {/* Event Description */}
              {event.description && (
                <div className="album-section">
                  <h2 className="album-section-title">
                    <FaInfoCircle className="album-section-icon" /> 
                    Event Overview
                  </h2>
                  <div className="album-section-content">
                    <p>{event.description}</p>
                  </div>
                </div>
              )}
              
              {/* Event Details Section */}
              {event.details && (
                <div className="album-section">
                  <h2 className="album-section-title">
                    <FaInfoCircle className="album-section-icon" /> 
                    Event Details
                  </h2>
                  <div className="album-section-content" dangerouslySetInnerHTML={{ __html: event.details }}>
                  </div>
                </div>
              )}
              
              {/* General Information Section */}
              <div className="album-section">
                <h2 className="album-section-title">
                  <FaInfoCircle className="album-section-icon" /> 
                  Additional Information
                </h2>
                <div className="album-section-content">
                  <p>Please arrive at least 15 minutes before the event starts to ensure smooth entry. For any questions or special accommodations, please contact our event team.</p>
                </div>
              </div>
              
              {/* Call-to-action buttons */}
              {!isPastEvent && (
                <div className="album-cta-container">
                  <button
                    onClick={handleReserveClick}
                    className="cta-button cta-button-spotify"
                    style={{
                      backgroundColor: "var(--color-neon-purple)",
                      cursor: "pointer",
                      border: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      fontWeight: "500",
                      padding: "0.75rem 1.5rem"
                    }}
                  >
                    <FaTicketAlt />
                    Reserve Your Spot
                  </button>
                  
                  {event.external_url && (
                    <Link
                      href={event.external_url}
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="cta-button cta-button-apple"
                    >
                      <FaInfoCircle />
                      Learn More
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
