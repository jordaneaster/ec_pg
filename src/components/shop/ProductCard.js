import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product }) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className="group">
      <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        <Image 
          src={product.image_url} 
          alt={product.name} 
          fill
          className={`object-cover transition-all duration-300 group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoadingComplete={() => setIsLoaded(true)}
        />
        
        {product.out_of_stock && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            Out of Stock
          </div>
        )}
      </div>
      
      <h3 className="font-medium text-gray-900">{product.name}</h3>
      
      <div className="flex justify-between items-center mt-1">
        <p className="font-semibold">${product.price.toFixed(2)}</p>
        <span className="text-sm text-gray-500">{product.category}</span>
      </div>
      
      <Link href={`/shop/${product.id}`} className="mt-3 block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
        View Details
      </Link>
    </div>
  );
}
