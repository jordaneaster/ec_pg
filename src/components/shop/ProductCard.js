import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AddToCartButton from './AddToCartButton'; // Import the AddToCartButton

export default function ProductCard({ product }) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <div className="product-card">
      {/* Product Image Container with proper aspect ratio */}
      <Link href={`/shop/${product.id}`} className="block">
        <div className="product-image-container">
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}
          
          <Image 
            src={product.image_url} 
            alt={product.name} 
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`product-image ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoadingComplete={() => setIsLoaded(true)}
          />
        </div>
        
        {/* Product Badges */}
        <div className="product-badges">
          {product.featured && (
            <span className="product-badge badge-featured">
              Featured
            </span>
          )}
          {product.out_of_stock && (
            <span className="product-badge badge-out-of-stock">
              Out of Stock
            </span>
          )}
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="product-details">
        <div className="product-category">{product.category}</div>
        
        <Link href={`/shop/${product.id}`}>
          <h3 className="product-name" title={product.name}>
            {product.name}
          </h3>
        </Link>
        
        <div className="product-price">${parseFloat(product.price).toFixed(2)}</div>
        
        <div className="flex justify-start">
          <AddToCartButton 
            product={product} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded px-1.5 py-0.5 text-xs transition duration-150 ease-in-out max-w-[80px]" 
          />
        </div>
      </div>
    </div>
  );
}
