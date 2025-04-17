// EventCard.js
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { cardOverrides } from '../../styles/custom-overrides';

export default function EventCard({ event }) {
  const router = useRouter();
  const eventDate = event.event_date ? new Date(event.event_date) : new Date();
  const now = new Date();
  const isPastEvent = eventDate < now;

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Add a function to handle direct reservation navigation
  const handleReserveClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    console.log("Reserve button clicked from card, navigating directly");
    window.location.href = `/reservations?event=${event.id}`;
  };

  return (
    <div 
      className={`event-card ${isPastEvent ? 'past-event' : ''} ${cardOverrides.eventCard}`} 
      data-date={eventDate.getTime()}
    >
      {/* Image Container with strict separation */}
      <div 
        className="event-card__image-container" 
        style={{ 
          position: 'relative',
          paddingTop: '86.25%', // 16:9 aspect ratio
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <Image
          src={event.image_url || '/placeholder-event.jpg'}
          alt={event.title}
          fill
          className="event-card__image"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'fill' }}
        />
        
        {event.is_featured && (
          <div className="event-card__featured-badge">
            Featured
          </div>
        )}
        
        {isPastEvent && (
          <div className="event-card__past-badge">
            Past Event
          </div>
        )}
      </div>

      {/* Content Container - completely separate from image */}
      <div className="event-card__content">
        <h3 className={`event-card__title ${cardOverrides.eventCardTitle}`}>
          {event.title}
        </h3>
        
        <div className={`event-card__meta ${cardOverrides.eventCardMeta}`}>
          <FaCalendarAlt className="event-card__icon" />
          <span className="event-card__date">{formatDate(eventDate)} • {formatTime(eventDate)}</span>
        </div>
        
        <div className={`event-card__meta ${cardOverrides.eventCardMeta}`}>
          <FaMapMarkerAlt className="event-card__icon" />
          <span className="event-card__location">{event.location}</span>
        </div>

        <p className={`event-card__description ${cardOverrides.eventCardText}`}>
          {event.description}
        </p>

        {/* Action Buttons - with clear visual separation */}
        <div className="event-card__actions">
          <Link
            href={`/events/${event.id}`}
            className={`event-card__button event-card__button--primary ${cardOverrides.eventCardButton}`}
          >
            Details
          </Link>
          {!isPastEvent && (
            <button
              onClick={handleReserveClick}
              className="reserve-button"
            >
              Reserve Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}