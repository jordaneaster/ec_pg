import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaCalendarAlt, FaEye, FaShare } from 'react-icons/fa';
import { getAllVideos, getVideoById } from '../../lib/videos';
import { VideoService } from '../../lib/video';

export async function getStaticPaths() {
  const videos = await getAllVideos();
  
  const paths = videos.map((video) => ({
    params: { id: video.id.toString() },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const video = await getVideoById(params.id);
  
  if (!video) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      video,
    },
    revalidate: 60, // Revalidate every minute
  };
}

export default function VideoDetails({ video }) {
  const router = useRouter();
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadVideo() {
      if (!video?.url) return;
      
      try {
        const signedUrl = await VideoService.getVideoUrl(video.url);
        setVideoUrl(signedUrl);
      } catch (err) {
        console.error('Error loading video URL:', err);
        setError('Failed to load video. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    loadVideo();
  }, [video]);

  if (router.isFallback || isLoading) {
    return (
      <div className="bg-gray-900 text-white min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-96">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
              <p className="text-gray-400">Loading video...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 text-white min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-8 text-center max-w-2xl mx-auto shadow-lg">
            <h2 className="text-2xl font-bold mb-3 text-red-300">Error</h2>
            <p className="mb-5">{error}</p>
            <button 
              onClick={() => router.reload()}
              className="mt-4 bg-white text-black px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const publishDate = video.published_date ? new Date(video.published_date) : null;
  
  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = () => {
    if (navigator.share && video.share_url) {
      navigator.share({
        title: video.title,
        text: video.description || 'Check out this video',
        url: video.share_url,
      }).catch(err => console.warn('Error sharing:', err));
    } else if (navigator.clipboard && video.share_url) {
      navigator.clipboard.writeText(video.share_url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Failed to copy:', err));
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Link href="/videos" className="inline-flex items-center text-gray-300 hover:text-white mb-8 group transition-colors">
          <span className="mr-2 transform group-hover:translate-x-[-4px] transition-transform">&larr;</span> 
          Back to Videos
        </Link>
        
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl transition-shadow hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]">
          {/* Video Player */}
          <div className="relative aspect-video w-full bg-black">
            {videoUrl && (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full"
                controls
                autoPlay
                playsInline
                poster={video.thumbnail_url}
              />
            )}
          </div>
          
          {/* Video Details */}
          <div className="p-6 md:p-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">{video.title}</h1>
            
            <div className="flex flex-wrap gap-6 mb-8 text-gray-300 border-b border-gray-700 pb-6">
              {publishDate && (
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-400" />
                  <span>{formatDate(publishDate)}</span>
                </div>
              )}
              
              {video.views !== undefined && (
                <div className="flex items-center gap-2">
                  <FaEye className="text-blue-400" />
                  <span>{video.views.toLocaleString()} views</span>
                </div>
              )}
            </div>
            
            {video.description && (
              <div className="prose prose-lg prose-invert max-w-none mb-10 leading-relaxed">
                <p>{video.description}</p>
              </div>
            )}
            
            {video.share_url && (
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md transition-colors font-medium"
              >
                <FaShare />
                Share
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
