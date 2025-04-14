import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaMusic, FaGlassCheers, FaCalendarAlt, FaPhotoVideo, FaArrowRight, FaVideo } from 'react-icons/fa';
import { getAllEvents, getFeaturedEvents } from '../lib/events';
import { getAllAlbums } from '../lib/albums';
import { getFeaturedVideos } from '../lib/videos';
import EventCard from '../components/events/EventCard';
import AlbumCard from '../components/music/AlbumCard';
import VideoCard from '../components/videos/VideoCard';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getStaticProps() {
  const allEvents = await getAllEvents();
  const featuredEvents = await getFeaturedEvents(3);
  const albums = await getAllAlbums();
  const featuredVideos = await getFeaturedVideos(3);

  let finalFeaturedEvents = featuredEvents;
  if (!finalFeaturedEvents.length && allEvents.length) {
    finalFeaturedEvents = allEvents.filter(event => event.is_featured).slice(0, 3);
  }

  return {
    props: {
      allEvents: allEvents.slice(0, 6),
      featuredEvents: finalFeaturedEvents,
      latestAlbums: albums.slice(0, 4),
      featuredVideos
    },
    revalidate: 60,
  };
}

export default function Home({ featuredEvents, latestAlbums, allEvents, featuredVideos }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitCount, setSubmitCount] = useState(0);
  const lastSubmitTime = useRef(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Client-side rendering data:', {
        featuredEventsCount: featuredEvents?.length || 0,
        allEventsCount: allEvents?.length || 0
      });
    }
  }, [featuredEvents, allEvents]);

  // Enhanced email validation with stricter regex
  const isValidEmail = (email) => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };

  // Sanitize input to prevent XSS
  const sanitizeInput = (input) => {
    return input.replace(/<[^>]*>/g, '').trim();
  };

  // Handle subscription form submission with enhanced security
  const handleSubscribe = async (e) => {
    e.preventDefault();

    // Reset any previous messages
    setMessage({ text: '', type: '' });

    // Simple rate limiting
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime.current;

    if (timeSinceLastSubmit < 2000) {
      setMessage({ 
        text: 'Please wait a moment before trying again.', 
        type: 'error' 
      });
      return;
    }

    setSubmitCount(prev => prev + 1);

    if (submitCount > 3 && timeSinceLastSubmit < 60000) {
      setMessage({ 
        text: 'Too many attempts. Please try again later.', 
        type: 'error' 
      });
      return;
    }

    lastSubmitTime.current = now;

    const sanitizedEmail = sanitizeInput(email);

    if (!sanitizedEmail) {
      setMessage({ text: 'Please enter your email address', type: 'error' });
      return;
    }

    if (!isValidEmail(sanitizedEmail)) {
      setMessage({ text: 'Please enter a valid email address', type: 'error' });
      return;
    }

    if (sanitizedEmail.includes('script') || 
        sanitizedEmail.includes('javascript') || 
        sanitizedEmail.includes('SELECT') ||
        sanitizedEmail.includes('DROP') ||
        sanitizedEmail.includes('INSERT') ||
        sanitizedEmail.includes('--')) {
      setMessage({ 
        text: 'Invalid email format detected', 
        type: 'error' 
      });
      return;
    }

    setIsLoading(true);

    try {
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
        setMessage({ 
          text: 'Request timed out. Please try again later.', 
          type: 'error' 
        });
      }, 10000);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{ email: sanitizedEmail }], { 
          returning: true 
        });

      clearTimeout(timeoutId);

      if (error) {
        console.error('Subscription error details:', error);

        if (error.code === '42501') {
          setMessage({ 
            text: 'Subscription feature is temporarily unavailable. Please try again later or contact us directly.', 
            type: 'error' 
          });
        } else if (error.code === '23505') {
          setMessage({ 
            text: 'You are already subscribed with this email', 
            type: 'error' 
          });
        } else if (error.code === '23514' || error.code === '22P02') {
          setMessage({ 
            text: 'Invalid input detected. Please try again with a valid email.', 
            type: 'error' 
          });
        } else {
          setMessage({ 
            text: 'Failed to subscribe. Please try again later.', 
            type: 'error' 
          });
        }
      } else {
        setMessage({ text: 'Thank you for subscribing!', type: 'success' });
        setEmail('');
        setSubmitCount(0);
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setMessage({ text: 'An error occurred. Please try again later.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-black opacity-95 z-0"></div>
        <div className="relative container mx-auto px-4 z-20 flex flex-col items-center justify-center text-center">
          <div className="program-logo-container mb-8">
            <div className="program-paper-fold">
              <Image
                src="/program10.png"
                alt="The Program"
                width={260}
                height={260}
                className="mx-auto"
                priority
              />
            </div>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-white leading-tight tracking-tight">
            THE PROGRAM
          </h1>
          <p className="text-lg md:text-xl mb-12 text-gray-300 font-serif italic max-w-2xl mx-auto">
            "Nothing is bigger than the program"
          </p>
          <div className="w-16 h-px bg-white mx-auto mb-12 opacity-70"></div>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link href="/events" className="program-btn program-btn-primary bg-white text-black hover:bg-transparent hover:text-white border-white transition-colors">
              View Events
            </Link>
            <Link href="/reservations" className="program-btn program-btn-secondary bg-white text-black hover:bg-black hover:text-white border-white transition-colors">
              Join The Program
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black to-transparent z-10"></div>
      </section>

      {/* Features Section */}
      <section className="program-features-section relative text-white">
        <div className="program-features-background">
          <Image
            src="/program11.png"
            alt="Program background"
            fill
            priority
            sizes="100vw"
            style={{
              filter: "brightness(0.85)"
            }}
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-black opacity-40"></div>
        <div className="container mx-auto px-4 max-w-6xl flex flex-col items-center relative z-[2]">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-5 text-white"></h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto font-serif"></p>
            <div className="w-16 h-px bg-white mx-auto mt-8 opacity-30"></div>
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-white opacity-10 z-10"></div>
      </section>

      <div className="section-separator"></div>

      {/* Featured Videos Section */}
      <section className="py-24 mt-24 relative bg-gray-800">
        <div className="container mx-auto px-4 max-w-6xl relative">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 border-b border-gray-700 pb-6">
            <Link href="/videos" className="flex items-center gap-2 group bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-sm transition-all duration-300">
              <span className="text-white group-hover:text-white transition-colors font-medium">
                View All Videos
              </span>
              <FaArrowRight className="text-white group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="event-grid">
            {featuredVideos.map((video) => (
              <div key={video.id}>
                <VideoCard video={video} autoplay={true} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 relative bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl relative">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 border-b border-gray-700 pb-6">
            <div className="mb-4 sm:mb-0">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3 text-white">
                Featured Events
              </h2>
              <p className="text-gray-300 text-lg max-w-xl leading-relaxed font-serif">Curated selection of premium experiences</p>
            </div>
            <Link href="/events" className="flex items-center gap-2 group bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-sm transition-all duration-300">
              <span className="text-white group-hover:text-white transition-colors font-medium">
                View All Events
              </span>
              <FaArrowRight className="text-white group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {featuredEvents && featuredEvents.length > 0 ? (
            <div className="event-grid">
              {featuredEvents.map((event) => (
                <div key={event.id}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-sm p-8 text-center border border-gray-700">
              <p className="text-gray-300 font-serif">New events coming soon</p>
              <p className="mt-4 text-white italic">Check back for updates</p>
            </div>
          )}
        </div>
      </section>

      {/* Music Releases Section */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 border-b border-gray-700 pb-6">
            <div className="mb-4 sm:mb-0">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-white">
                Latest Releases
              </h2>
              <p className="text-gray-300 text-lg max-w-xl font-serif">Fresh tracks from featured artists</p>
            </div>
            <Link href="/music" className="flex items-center gap-2 group">
              <span className="text-white group-hover:text-gray-300 transition-colors font-medium">
                View All Albums
              </span>
              <FaArrowRight className="text-white group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="event-grid">
            {latestAlbums.map(album => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative">
          <div className="bg-gray-900/80 rounded-sm p-12 backdrop-blur-lg border border-gray-800">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-white">Stay Connected</h2>
              <p className="text-xl mb-8 text-gray-300 font-serif">Get exclusive access to event presales and artist updates</p>

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="bg-black/50 text-white px-6 py-4 rounded-none focus:outline-none focus:ring-1 focus:ring-white/50 transition-all"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value.substring(0, 100))}
                  disabled={isLoading || submitCount > 5}
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  className={`bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-none font-serif transition-all ${
                    isLoading || submitCount > 5 ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  disabled={isLoading || submitCount > 5}
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>

              {message.text && (
                <div className={`mt-4 p-2 ${
                  message.type === 'success' 
                    ? 'text-green-400 bg-green-900/20 border border-green-800' 
                    : 'text-red-400 bg-red-900/20 border border-red-800'
                } rounded`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}