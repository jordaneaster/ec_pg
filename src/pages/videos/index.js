import React from 'react';
import { getAllVideos, getFeaturedVideos } from '../../lib/videos';
import VideoCard from '../../components/videos/VideoCard';

export async function getStaticProps() {
  const allVideos = await getAllVideos();
  
  return {
    props: {
      allVideos
    },
    revalidate: 60, // Revalidate every minute
  };
}

export default function VideosPage({ allVideos, featuredVideos }) {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Videos</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Watch performances, interviews, and behind-the-scenes content
          </p>
        </div>
        
        {allVideos.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">All Videos</h2>
            <div className="event-grid">
              {allVideos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No videos found</p>
          </div>
        )}
      </div>
    </div>
  );
}
