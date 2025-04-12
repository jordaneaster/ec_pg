import React, { useState } from 'react';
import { getAllEvents } from '../../lib/events';
import EventCard from '../../components/events/EventCard';

export async function getStaticProps() {
  const events = await getAllEvents();
  
  return {
    props: {
      events,
    },
    revalidate: 60, // Revalidate every minute
  };
}

export default function EventsPage({ events }) {
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  
  const now = new Date();
  
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.event_date);
    
    if (filter === 'upcoming') {
      return eventDate >= now;
    } else if (filter === 'past') {
      return eventDate < now;
    }
    
    return true; // 'all'
  });
  
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Events</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join us for exclusive experiences and performances
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-800 rounded-md p-1">
            <button
              className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
              onClick={() => setFilter('all')}
            >
              All Events
            </button>
            <button
              className={`px-4 py-2 rounded-md ${filter === 'upcoming' ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`px-4 py-2 rounded-md ${filter === 'past' ? 'bg-gray-700 text-white' : 'text-gray-300'}`}
              onClick={() => setFilter('past')}
            >
              Past Events
            </button>
          </div>
        </div>
        
        {filteredEvents.length > 0 ? (
          <div className="event-grid">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
}
