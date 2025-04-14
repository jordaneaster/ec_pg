import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { getShopItems, getShopCategories } from '../../lib/shop';
import ProductCard from '../../components/shop/ProductCard';
import { XMarkIcon, FunnelIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function ShopPage({ initialProducts, categories }) {
  // State management
  const [products, setProducts] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Filter and fetch products
  useEffect(() => {
    async function loadFilteredProducts() {
      setLoading(true);
      
      // Fetch products with selected category
      let filteredProducts = await getShopItems(selectedCategory);
      
      // Apply client-side filters
      if (inStockOnly) {
        filteredProducts = filteredProducts.filter(p => !p.out_of_stock);
      }
      
      if (featuredOnly) {
        filteredProducts = filteredProducts.filter(p => p.featured);
      }
      
      if (priceRange.min) {
        filteredProducts = filteredProducts.filter(p => parseFloat(p.price) >= parseFloat(priceRange.min));
      }
      
      if (priceRange.max) {
        filteredProducts = filteredProducts.filter(p => parseFloat(p.price) <= parseFloat(priceRange.max));
      }
      
      // Apply sorting
      filteredProducts = sortProducts(filteredProducts, sortOption);
      
      setProducts(filteredProducts);
      setLoading(false);
    }
    
    loadFilteredProducts();
  }, [selectedCategory, sortOption, inStockOnly, featuredOnly, priceRange]);

  // Sort function
  const sortProducts = (productsToSort, sortBy) => {
    switch (sortBy) {
      case 'price-asc':
        return [...productsToSort].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price-desc':
        return [...productsToSort].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'name-asc':
        return [...productsToSort].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return [...productsToSort].sort((a, b) => b.name.localeCompare(a.name));
      case 'newest':
      default:
        return [...productsToSort].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory(null);
    setPriceRange({ min: '', max: '' });
    setInStockOnly(false);
    setFeaturedOnly(false);
    setSortOption('newest');
  };

  return (
    <>
      <Head>
        <title>Shop | PGE</title>
        <meta name="description" content="Browse our collection of products" />
        {/* Add a global style to prevent text selection and cursor changes on non-input elements */}
        <style jsx global>{`
          body {
            user-select: none;
          }
          input, textarea, select, button, a {
            user-select: auto;
          }
          .sort-select, input[type="number"], input[type="checkbox"], input[type="radio"] {
            cursor: pointer;
          }
          button {
            cursor: pointer;
          }
          .products-grid, .empty-state, .shop-controls, .shop-container {
            cursor: default;
          }
        `}</style>
      </Head>
      
      {/* Shop Header Banner - keeps the site's main navigation above this */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Shop Our Collection</h1>
          <p className="text-blue-100 max-w-2xl">
            Discover high-quality products that match your style and needs.
          </p>
        </div>
      </div>
      

      
      {/* Main content - This will sit between the navigation and footer */}
      <div className="shop-container py-8">
        {/* Shop controls and sorting */}
        <div className="shop-controls">
          <div className="shop-results">
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
            {selectedCategory && categories.find(c => c.id === selectedCategory) ? 
              ` in "${categories.find(c => c.id === selectedCategory).name}"` : ''}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mobile filter button */}
            <button 
              className="mobile-filter-button md:hidden"
              onClick={() => setFilterOpen(true)}
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
            
            {/* Sort dropdown */}
            <div className="sort-container relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="sort-select appearance-none pr-8"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <div className="shop-layout">
          {/* Filters Sidebar */}
          <div className={`shop-filters ${filterOpen ? 'active' : ''}`}>
            {/* Mobile filter header */}
            <div className="filter-header-mobile md:hidden">
              <h2 className="filter-title-mobile">Filters</h2>
              <button 
                className="filter-close-mobile"
                onClick={() => setFilterOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* Categories */}
            <div className="filter-section">
              <h3 className="filter-header">Categories</h3>
              <ul className="filter-list">
                <li className="filter-option">
                  <label>
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === null}
                      onChange={() => setSelectedCategory(null)}
                    />
                    All Products
                  </label>
                </li>
                
                {categories.map((category) => (
                  <li key={category.id} className="filter-option">
                    <label>
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.id}
                        onChange={() => setSelectedCategory(category.id)}
                      />
                      {category.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Price Range */}
            <div className="filter-section">
              <h3 className="filter-header">Price Range</h3>
              <div className="flex space-x-2 mb-3">
                <div>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                  />
                </div>
                <div className="flex items-center">-</div>
                <div>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Product Status */}
            <div className="filter-section">
              <h3 className="filter-header">Product Status</h3>
              <ul className="filter-list">
                <li className="filter-option">
                  <label>
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    In Stock Only
                  </label>
                </li>
                <li className="filter-option">
                  <label>
                    <input
                      type="checkbox"
                      checked={featuredOnly}
                      onChange={(e) => setFeaturedOnly(e.target.checked)}
                    />
                    Featured Products
                  </label>
                </li>
              </ul>
            </div>
            
            {/* Reset Button */}
            <div className="filter-section">
              <button
                onClick={resetFilters}
                className="filter-reset"
              >
                Reset All Filters
              </button>
            </div>
            
            {/* Mobile Apply button */}
            <div className="filter-apply-mobile md:hidden">
              <button
                onClick={() => setFilterOpen(false)}
                className="filter-apply-button"
              >
                Apply Filters
              </button>
            </div>
          </div>
          
          {/* Product Grid */}
          <div>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product.id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="empty-state-title">No Products Found</h3>
                <p className="empty-state-text">Try adjusting your filters to find what you're looking for.</p>
                <button
                  onClick={resetFilters}
                  className="empty-state-button"
                >
                  Clear Filters
                </button>
              </div>
            )}
            
            {/* Pagination */}
            {products.length > 0 && (
              <div className="pagination">
                <button className="pagination-item disabled">
                  &laquo;
                </button>
                <button className="pagination-item active">1</button>
                <button className="pagination-item">2</button>
                <button className="pagination-item">3</button>
                <button className="pagination-item">
                  &raquo;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  const products = await getShopItems();
  const categories = await getShopCategories();
  
  return {
    props: {
      initialProducts: products,
      categories: categories,
    },
  };
}
