import React from 'react';
import { getAllAlbums } from '../../lib/albums';
import AlbumCard from '../../components/music/AlbumCard';

export async function getStaticProps() {
  const albums = await getAllAlbums();
  
  return {
    props: {
      albums,
    },
    revalidate: 60, // Revalidate every minute
  };
}

export default function MusicPage({ albums }) {
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Music</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore our latest releases and featured artists
          </p>
        </div>
        
        {albums.length > 0 ? (
          <div className="event-grid">
            {albums.map(album => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No albums found</p>
          </div>
        )}
      </div>
    </div>
  );
}
