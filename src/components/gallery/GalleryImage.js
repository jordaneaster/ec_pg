import React, { useState } from 'react';
import Image from 'next/image';

export default function GalleryImage({ image }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  
  // Handle image click to toggle enlarged view
  const handleImageClick = () => {
    setIsEnlarged(!isEnlarged);
  };

  // Handle closing of enlarged view
  const handleClose = (e) => {
    if (e.target === e.currentTarget) {
      setIsEnlarged(false);
    }
  };
  
  return (
    <>
      <div 
        className="relative overflow-hidden rounded-lg group gallery-item"
        style={{ 
          height: '100%',
          minHeight: '320px' // Increased from 200px to make images taller
        }}
      >
        {/* Loading placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}
        
        <div className="relative w-full h-full">
          <Image 
            src={image.url} 
            alt={image.caption || 'Gallery image'} 
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-500 group-hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoadingComplete={() => setIsLoaded(true)}
            onClick={handleImageClick}
          />
        </div>
        
        {/* Caption overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          {image.caption && (
            <p className="text-white font-medium">{image.caption}</p>
          )}
          <p className="text-gray-300 text-sm">{image.category}</p>
        </div>
      </div>

      {/* Enlarged image view (lightbox) */}
      {isEnlarged && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-pointer backdrop-blur-sm"
          onClick={handleClose}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full">
            <button 
              className="absolute top-4 right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              onClick={() => setIsEnlarged(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="relative w-full h-full">
              <Image
                src={image.url}
                alt={image.caption || 'Gallery image'}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            {image.caption && (
              <div className="absolute bottom-0 inset-x-0 p-4 bg-black/50 text-white">
                <p className="text-center">{image.caption}</p>
                {image.category && <p className="text-sm text-gray-300 text-center">{image.category}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
