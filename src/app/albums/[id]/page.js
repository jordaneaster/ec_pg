import Image from 'next/image';
import Link from 'next/link';
import { FaSpotify, FaApple, FaCalendarAlt } from 'react-icons/fa';
import { getAlbumById } from '../../../lib/albums';
import { notFound } from 'next/navigation';

export default async function AlbumDetailPage({ params }) {
  const album = await getAlbumById(params.id);
  
  if (!album) {
    notFound();
  }
  
  const releaseDate = album.release_date ? new Date(album.release_date) : null;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="relative w-full md:w-1/3 aspect-square">
          <Image 
            src={album.cover_image_url || '/placeholder-album.jpg'} 
            alt={`${album.title} cover`}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 400px"
            priority
          />
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{album.title}</h1>
          <p className="text-xl my-2">{album.artist}</p>
          
          {releaseDate && (
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <FaCalendarAlt />
              <span>{releaseDate.toLocaleDateString()}</span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-3 my-6">
            {album.spotify_url && (
              <Link 
                href={album.spotify_url} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded"
              >
                <FaSpotify /> Listen on Spotify
              </Link>
            )}
            
            {album.apple_music_url && (
              <Link 
                href={album.apple_music_url} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded"
              >
                <FaApple /> Listen on Apple Music
              </Link>
            )}
          </div>
          
          <Link href="/albums" className="text-blue-600 hover:underline">
            Back to all albums
          </Link>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const album = await getAlbumById(params.id);
  
  if (!album) {
    return {
      title: 'Album Not Found',
    };
  }
  
  return {
    title: `${album.title} by ${album.artist}`,
  };
}
