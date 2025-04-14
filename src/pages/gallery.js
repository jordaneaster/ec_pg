import { useState, useEffect } from 'react';
import Head from 'next/head';
import GalleryImage from '../components/gallery/GalleryImage';
import { getGalleryImages } from '../lib/gallery';

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      setLoading(true);
      const galleryImages = await getGalleryImages(selectedCategory, 50);
      setImages(galleryImages);
      setLoading(false);
      
      // Extract unique categories if we have all images
      if (!selectedCategory) {
        const uniqueCategories = [...new Set(galleryImages.map(img => img.category).filter(Boolean))];
        setCategories(uniqueCategories);
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
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Gallery</h1>
        
        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button 
            className={`px-4 py-2 rounded-full text-sm font-medium ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          
          {categories.map(category => (
            <button 
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === category ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image) => (
              <div key={image.id}>
                <GalleryImage image={image} />
              </div>
            ))}
          </div>
        )}
        
        {!loading && images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No images found</p>
          </div>
        )}
      </div>
    </>
  );
}
