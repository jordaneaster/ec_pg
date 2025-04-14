import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaMusic, FaGlassCheers, FaCalendarAlt, FaPhotoVideo, FaArrowRight, FaVideo } from 'react-icons/fa';
import { getAllEvents, getFeaturedEvents } from '../lib/events';
import { getAllAlbums } from '../lib/albums';
import { getFeaturedVideos } from '../lib/videos';
import EventCard from '../components/events/EventCard';
import AlbumCard from '../components/music/AlbumCard';
import VideoCard from '../components/videos/VideoCard';

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
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Client-side rendering data:', {
        featuredEventsCount: featuredEvents?.length || 0,
        allEventsCount: allEvents?.length || 0
      });
    }
  }, [featuredEvents, allEvents]);

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section - with updated button styles */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        {/* Background with subtle texture */}
        <div className="absolute inset-0 bg-black opacity-95 z-0"></div>

        {/* Logo Container with Paper Fold Effect */}
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

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black to-transparent z-10"></div>
      </section>

      {/* Features Section - Updated for full background image display */}
      <section className="program-features-section relative text-white">
        {/* Background Image with full display */}
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
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-5 text-white">
              
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto font-serif"></p>
            <div className="w-16 h-px bg-white mx-auto mt-8 opacity-30"></div>
          </div>

         
        </div>

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-white opacity-10 z-10"></div>
      </section>

      {/* Add this separator element between sections */}
      <div className="section-separator"></div>

      {/* Featured Videos Section - Updated styling for clear separation */}
      <section className="py-24 mt-24 relative bg-gray-800"> {/* Increased py-20 to py-24 and mt-20 to mt-24 */}
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

      {/* Featured Events - Updated terminology and darker background */}
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

      {/* Music Releases - Updated terminology and darker background */}
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

      {/* Newsletter - Updated terminology */}
      <section className="py-16 bg-black relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative">
          <div className="bg-gray-900/80 rounded-sm p-12 backdrop-blur-lg border border-gray-800">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-white">Stay Connected</h2>
              <p className="text-xl mb-8 text-gray-300 font-serif">Get exclusive access to event presales and artist updates</p>

              <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="bg-black/50 text-white px-6 py-4 rounded-none focus:outline-none focus:ring-1 focus:ring-white/50 transition-all"
                  required
                />
                <button
                  type="submit"
                  className="bg-white text-black hover:bg-gray-200 px-8 py-4 rounded-none font-serif transition-all"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}