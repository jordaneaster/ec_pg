import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaTicketAlt } from 'react-icons/fa';
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

  if (router.isFallback) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
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
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <Link href="/events" className="inline-flex items-center text-gray-300 hover:text-white mb-6">
          &larr; Back to Events
        </Link>
        
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          {/* Hero Image */}
          <div className="relative h-96 w-full">
            <Image
              src={event.image_url || '/placeholder-event.jpg'}
              alt={event.title}
              fill
              priority
              className="object-cover"
            />
            {isPastEvent && (
              <div className="absolute top-4 right-4 bg-red-600 text-white py-2 px-4 rounded-md">
                Past Event
              </div>
            )}
            {event.is_featured && !isPastEvent && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white py-2 px-4 rounded-md">
                Featured Event
              </div>
            )}
          </div>
          
          {/* Event Details */}
          <div className="p-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
            
            <div className="flex flex-wrap gap-6 mb-8 text-gray-300">
              <div className="flex items-center gap-2">
                <FaCalendarAlt />
                <span>{formatDate(eventDate)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <FaClock />
                <span>{formatTime(eventDate)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt />
                <span>{event.location}</span>
              </div>
            </div>
            
            <div className="prose prose-lg prose-invert max-w-none mb-8">
              <p className="text-xl">{event.description}</p>
              
              {event.details && (
                <div className="mt-6" dangerouslySetInnerHTML={{ __html: event.details }} />
              )}
            </div>
            
            {!isPastEvent && (
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/reservations?event=${event.id}`}
                  className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-md font-medium text-center"
                >
                  <FaTicketAlt className="inline-block mr-2" />
                  Reserve Your Spot
                </Link>
                
                {event.external_url && (
                  <Link
                    href={event.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-white text-white hover:bg-white hover:text-black px-6 py-3 rounded-md font-medium text-center"
                  >
                    Learn More
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
