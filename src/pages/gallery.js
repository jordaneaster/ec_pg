import { useState, useEffect } from 'react';
import Head from 'next/head';
import GalleryImage from '../components/gallery/GalleryImage';
import { getGalleryImages } from '../lib/gallery';

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadImages() {
      setLoading(true);
      setError(null);
      try {
        const galleryImages = await getGalleryImages(selectedCategory, 50);
        setImages(galleryImages);
        
        // Extract unique categories if we have all images
        if (!selectedCategory) {
          const uniqueCategories = [...new Set(galleryImages.map(img => img.category).filter(Boolean))];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error("Error loading gallery images:", err);
        setError("Unable to load gallery images. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    loadImages();
  }, [selectedCategory]);

  return (
    <>
      <Head>
        <title>Gallery | Your Site Name</title>
        <meta name="description" content="Browse our gallery of images" />
      </Head>
      
      <div className="container mx-auto px-6 py-16"> {/* Increased padding */}
        <h1 className="text-4xl font-bold mb-12 text-center">Gallery</h1> {/* Increased margin-bottom */}
        
        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button 
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              !selectedCategory ? 
              'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 
              'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white'
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          
          {categories.map(category => (
            <button 
              key={category}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category ? 
                'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 
                'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => {
                setSelectedCategory(null);
                setError(null);
                setLoading(true);
              }}
            >
              Try Again
            </button>
          </div>
        )}
        
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500">Loading gallery...</p>
          </div>
        ) : (
          <>
            {images.length > 0 ? (
              <div className="gallery-masonry px-4"> {/* Added horizontal padding */}
                {images.map((image) => (
                  <div 
                    key={image.id} 
                    className="gallery-masonry-item"
                  >
                    <GalleryImage image={image} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No images found in this category</p>
                {selectedCategory && (
                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    onClick={() => setSelectedCategory(null)}
                  >
                    View All Images
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
