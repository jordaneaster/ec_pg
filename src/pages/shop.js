import { useState, useEffect } from 'react';
import Head from 'next/head';
import ProductCard from '../components/shop/ProductCard';
import { getShopItems, getShopCategories } from '../lib/shop';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // Load products
      const shopItems = await getShopItems(selectedCategory);
      setProducts(shopItems);
      
      // Load categories if not already loaded
      if (categories.length === 0) {
        const shopCategories = await getShopCategories();
        setCategories(shopCategories);
      }
      
      setLoading(false);
    }
    
    loadData();
  }, [selectedCategory, categories.length]);

  return (
    <>
      <Head>
        <title>Shop | Your Site Name</title>
        <meta name="description" content="Browse our merchandise and products" />
      </Head>
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6 text-center">Shop</h1>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Browse our collection of merchandise and products. Support us by purchasing our exclusive items.
        </p>
        
        {/* Category filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button 
            className={`px-4 py-2 rounded-full text-sm font-medium ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            onClick={() => setSelectedCategory(null)}
          >
            All Products
          </button>
          
          {categories.map(cat => (
            <button 
              key={cat.id}
              className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found in this category</p>
          </div>
        )}
      </div>
    </>
  );
}
