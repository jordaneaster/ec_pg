import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { FaCalendarAlt, FaUser, FaSpotify, FaApple, FaPlayCircle } from 'react-icons/fa';
import { getAllAlbums, getAlbumById } from '../../lib/albums';

export async function getStaticPaths() {
  const albums = await getAllAlbums();
  
  const paths = albums.map((album) => ({
    params: { id: album.id.toString() },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const album = await getAlbumById(params.id);
  
  if (!album) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      album,
    },
    revalidate: 60, // Revalidate every minute
  };
}

export default function AlbumDetails({ album }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="bg-gray-900 text-white min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-96">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
              <p className="text-gray-400">Loading album details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const releaseDate = album.release_date ? new Date(album.release_date) : null;

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Link href="/music" className="inline-flex items-center text-gray-300 hover:text-white mb-8 group transition-colors">
          <span className="mr-2 transform group-hover:translate-x-[-4px] transition-transform">&larr;</span> 
          Back to Music
        </Link>
        
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl transition-shadow hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]">
          <div className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row gap-10">
              {/* Album Cover */}
              <div className="md:w-1/3 flex flex-col items-center md:items-start">
                <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  <Image
                    src={album.cover_image_url || '/placeholder-album.jpg'}
                    alt={`${album.title} cover`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    priority
                  />
                </div>
                
                <div className="mt-8 space-y-4 w-full">
                  {album.spotify_url && (
                    <Link
                      href={album.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 bg-[#1DB954] text-black px-6 py-3 rounded-md font-medium w-full hover:brightness-110 transition-all"
                    >
                      <FaSpotify size={22} />
                      Listen on Spotify
                    </Link>
                  )}
                  
                  {album.apple_music_url && (
                    <Link
                      href={album.apple_music_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 bg-white text-black px-6 py-3 rounded-md font-medium w-full hover:brightness-90 transition-all"
                    >
                      <FaApple size={22} />
                      Listen on Apple Music
                    </Link>
                  )}
                </div>
              </div>
              
              {/* Album Details */}
              <div className="md:w-2/3">
                <h1 className="text-3xl md:text-5xl font-bold mb-2">{album.title}</h1>
                <h2 className="text-xl text-blue-400 mb-4 font-medium">{album.artist}</h2>
                
                <div className="flex items-center gap-3 mb-6 text-gray-300">
                  <div className="bg-blue-600/20 p-2 rounded-full">
                    <FaCalendarAlt className="text-blue-400" />
                  </div>
                  <span>{releaseDate ? releaseDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Release date unknown'}</span>
                </div>
                
                {album.description && (
                  <div className="prose prose-lg prose-invert max-w-none mb-8 leading-relaxed">
                    <p>{album.description}</p>
                  </div>
                )}
                
                {/* Tracks List */}
                {album.tracks && album.tracks.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-2xl font-semibold mb-5 flex items-center">
                      <span className="bg-blue-600/20 p-2 rounded-full mr-2">
                        <FaPlayCircle className="text-blue-400" />
                      </span>
                      Tracks
                    </h3>
                    
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {album.tracks.map((track, index) => (
                        <div 
                          key={track.id} 
                          className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400 w-6 text-right font-mono">{(index + 1).toString().padStart(2, '0')}</span>
                            <span className="font-medium">{track.title}</span>
                          </div>
                          
                          {track.duration && (
                            <span className="text-gray-400 font-mono">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add global css to your global stylesheet:
/*
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.3);
}
*/
