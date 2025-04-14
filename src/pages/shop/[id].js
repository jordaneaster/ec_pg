import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { getShopItemById, getShopItems } from '../../lib/shop';
import { ShoppingCartIcon, ArrowLeftIcon, ShieldCheckIcon, TruckIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import ProductCard from '../../components/shop/ProductCard';

export default function ProductDetailPage({ product, relatedProducts }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="mb-8">The product you are looking for does not exist or has been removed.</p>
        <Link href="/shop" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product.name} | PGE Shop</title>
        <meta name="description" content={product.description || `Details about ${product.name}`} />
      </Head>
      
      {/* Product detail content */}
      <div className="product-detail-container">
        {/* Breadcrumb */}
        <div className="product-detail-breadcrumb">
          <Link href="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link href="/shop" className="breadcrumb-link">Shop</Link>
          <span className="breadcrumb-separator">/</span>
          <Link 
            href={`/shop?category=${product.category_id}`} 
            className="breadcrumb-link"
          >
            {product.category}
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>
        
        <div className="product-detail-layout">
          {/* Product Image */}
          <div className="product-detail-image">
            {!isLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}
            
            <Image 
              src={product.image_url} 
              alt={product.name} 
              fill
              priority
              className={`${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoadingComplete={() => setIsLoaded(true)}
            />
            
            {/* Badges */}
            <div className="product-badges">
              {product.featured && (
                <span className="product-badge badge-featured">
                  Featured
                </span>
              )}
            </div>
          </div>
          
          {/* Product Details */}
          <div className="product-detail-content">
            <div className="product-detail-category">{product.category}</div>
            <h1 className="product-detail-name">{product.name}</h1>
            
            <div className="product-detail-price">
              ${parseFloat(product.price).toFixed(2)}
            </div>
            
            <span className={`product-detail-status ${product.out_of_stock ? 'out-of-stock' : 'in-stock'}`}>
              {product.out_of_stock ? 'Out of Stock' : 'In Stock'}
            </span>
            
            {/* Description */}
            {product.description && (
              <div className="product-detail-section">
                <h2 className="product-detail-section-title">About this product</h2>
                <p className="product-detail-description">{product.description}</p>
              </div>
            )}
            
            {/* Quantity and Add to Cart */}
            {!product.out_of_stock && (
              <div className="product-detail-quantity">
                <label htmlFor="quantity" className="quantity-label">
                  Quantity
                </label>
                <div className="quantity-input-group">
                  <button 
                    onClick={decreaseQuantity}
                    className="quantity-button"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="quantity-input"
                  />
                  <button 
                    onClick={increaseQuantity}
                    className="quantity-button"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            
            <div className="product-detail-actions">
              <button 
                className={`product-detail-button product-detail-button-primary ${product.out_of_stock ? 'disabled' : ''}`}
                disabled={product.out_of_stock}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {product.out_of_stock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              
              <button 
                className="product-detail-button product-detail-button-secondary"
                disabled={product.out_of_stock}
              >
                Buy Now
              </button>
            </div>
            
            {/* Product Features */}
            <div className="product-detail-features">
              <div className="product-detail-feature">
                <TruckIcon className="feature-icon h-5 w-5" />
                <div className="feature-content">
                  <h4>Free Shipping</h4>
                  <p>Free standard shipping on all orders</p>
                </div>
              </div>
              
              <div className="product-detail-feature">
                <ShieldCheckIcon className="feature-icon h-5 w-5" />
                <div className="feature-content">
                  <h4>Secure Payments</h4>
                  <p>Your payment information is processed securely</p>
                </div>
              </div>
              
              <div className="product-detail-feature">
                <CreditCardIcon className="feature-icon h-5 w-5" />
                <div className="feature-content">
                  <h4>Easy Returns</h4>
                  <p>Simple returns within 30 days of purchase</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2 className="related-products-title">You might also like</h2>
            <div className="products-grid">
              {relatedProducts.map(product => (
                <div key={product.id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const product = await getShopItemById(params.id);
  
  let relatedProducts = [];
  if (product) {
    const allProducts = await getShopItems(product.category_id, 5);
    relatedProducts = allProducts.filter(p => p.id !== product.id).slice(0, 4);
  }
  
  return {
    props: {
      product: product || null,
      relatedProducts: relatedProducts || [],
    },
  };
}
