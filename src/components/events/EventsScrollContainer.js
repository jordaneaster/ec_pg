import React, { useRef, useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import EventCard from './EventCard';

export default function EventsScrollContainer({ events }) {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Check if arrows should be displayed
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    
    // Show left arrow if not at the start
    setShowLeftArrow(scrollLeft > 0);
    
    // Show right arrow if not at the end
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };
  
  // Scroll handling functions
  const scrollLeft = () => {
    if (!scrollContainerRef.current) return;
    const cardWidth = 300; // Approximate card width + margin
    scrollContainerRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  };
  
  const scrollRight = () => {
    if (!scrollContainerRef.current) return;
    const cardWidth = 300; // Approximate card width + margin
    scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
  };
  
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      // Initial check
      checkScrollPosition();
      
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, []);
  
  // Recheck arrow visibility when events change
  useEffect(() => {
    checkScrollPosition();
  }, [events]);
  
  return (
    <div className="events-scroll-wrapper">
      {/* Left Navigation Arrow */}
      <button 
        className={`event-scroll-arrow event-scroll-arrow--left ${!showLeftArrow ? 'hidden' : ''}`}
        onClick={scrollLeft}
        aria-label="Scroll to earlier events"
      >
        <FaChevronLeft />
      </button>
      
      {/* Scrollable Container */}
      <div className="events-scroll-container" ref={scrollContainerRef}>
        {events.map(event => (
          <div className="events-scroll-item" key={event.id}>
            <EventCard event={event} />
          </div>
        ))}
      </div>
      
      {/* Right Navigation Arrow */}
      <button 
        className={`event-scroll-arrow event-scroll-arrow--right ${!showRightArrow ? 'hidden' : ''}`}
        onClick={scrollRight}
        aria-label="Scroll to later events"
      >
        <FaChevronRight />
      </button>
    </div>
  );
}
