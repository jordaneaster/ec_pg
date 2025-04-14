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
    return (
      <div className="bg-gray-900 text-white min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-96">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
              <p className="text-gray-400">Loading event details...</p>
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
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Link href="/events" className="inline-flex items-center text-gray-300 hover:text-white mb-8 group transition-colors">
          <span className="mr-2 transform group-hover:translate-x-[-4px] transition-transform">&larr;</span> 
          Back to Events
        </Link>
        
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl transition-shadow hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]">
          {/* Hero Image */}
          <div className="relative w-full aspect-[21/9] md:aspect-[3/1]">
            <Image
              src={event.image_url || '/placeholder-event.jpg'}
              alt={event.title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-10">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 text-white drop-shadow-lg">{event.title}</h1>
            </div>
            
            {isPastEvent && (
              <div className="absolute top-6 right-6 bg-red-600 text-white py-2 px-6 rounded-md font-medium shadow-lg">
                Past Event
              </div>
            )}
            {event.is_featured && !isPastEvent && (
              <div className="absolute top-6 right-6 bg-blue-600 text-white py-2 px-6 rounded-md font-medium shadow-lg">
                Featured Event
              </div>
            )}
          </div>
          
          {/* Event Details */}
          <div className="p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-gray-300 bg-gray-700/30 p-5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/20 p-3 rounded-full">
                  <FaCalendarAlt className="text-blue-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="font-medium">{formatDate(eventDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/20 p-3 rounded-full">
                  <FaClock className="text-blue-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Time</p>
                  <p className="font-medium">{formatTime(eventDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/20 p-3 rounded-full">
                  <FaMapMarkerAlt className="text-blue-400 text-xl" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>
            </div>
            
            <div className="prose prose-lg prose-invert max-w-none mb-10">
              <p className="text-xl leading-relaxed">{event.description}</p>
              
              {event.details && (
                <div className="mt-8 border-t border-gray-700 pt-8" dangerouslySetInnerHTML={{ __html: event.details }} />
              )}
            </div>
            
            {!isPastEvent && (
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href={`/reservations?event=${event.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md font-medium text-center transition-colors shadow-lg"
                >
                  <FaTicketAlt className="inline-block mr-2" />
                  Reserve Your Spot
                </Link>
                
                {event.external_url && (
                  <Link
                    href={event.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-md font-medium text-center transition-all"
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
