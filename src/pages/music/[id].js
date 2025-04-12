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
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  const releaseDate = album.release_date ? new Date(album.release_date) : null;

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <Link href="/music" className="inline-flex items-center text-gray-300 hover:text-white mb-6">
          &larr; Back to Music
        </Link>
        
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Album Cover */}
              <div className="md:w-1/3">
                <div className="relative aspect-square overflow-hidden rounded-md shadow-lg">
                  <Image
                    src={album.cover_image_url || '/placeholder-album.jpg'}
                    alt={`${album.title} cover`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                
                <div className="mt-6 space-y-4">
                  {album.spotify_url && (
                    <Link
                      href={album.spotify_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-[#1DB954] text-black px-6 py-3 rounded-md font-medium w-full"
                    >
                      <FaSpotify size={20} />
                      Listen on Spotify
                    </Link>
                  )}
                  
                  {album.apple_music_url && (
                    <Link
                      href={album.apple_music_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-md font-medium w-full"
                    >
                      <FaApple size={20} />
                      Listen on Apple Music
                    </Link>
                  )}
                </div>
              </div>
              
              {/* Album Details */}
              <div className="md:w-2/3">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{album.title}</h1>
                <h2 className="text-xl text-gray-300 mb-4">{album.artist}</h2>
                
                <div className="flex items-center gap-2 mb-6 text-gray-400">
                  <FaCalendarAlt />
                  <span>{releaseDate ? releaseDate.toLocaleDateString() : 'Release date unknown'}</span>
                </div>
                
                {album.description && (
                  <div className="prose prose-lg prose-invert max-w-none mb-8">
                    <p>{album.description}</p>
                  </div>
                )}
                
                {/* Tracks List */}
                {album.tracks && album.tracks.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Tracks</h3>
                    
                    <div className="space-y-2">
                      {album.tracks.map((track, index) => (
                        <div 
                          key={track.id} 
                          className="flex items-center justify-between p-3 bg-gray-700 bg-opacity-30 rounded hover:bg-gray-700"
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-gray-400 w-6 text-right">{index + 1}</span>
                            <span>{track.title}</span>
                          </div>
                          
                          {track.duration && (
                            <span className="text-gray-400">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
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
