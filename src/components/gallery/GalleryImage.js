import React, { useState } from 'react';
import Image from 'next/image';

export default function GalleryImage({ image }) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg group">
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
      
      <Image 
        src={image.url} 
        alt={image.caption || 'Gallery image'} 
        fill
        className={`object-cover transition-all duration-500 group-hover:scale-110 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoadingComplete={() => setIsLoaded(true)}
      />
      
      {/* Caption overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        {image.caption && (
          <p className="text-white font-medium">{image.caption}</p>
        )}
        <p className="text-gray-300 text-sm">{image.category}</p>
      </div>
    </div>
  );
}
