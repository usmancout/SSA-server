import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Star, ExternalLink, Heart, Grid, List } from 'lucide-react';
import { mockProducts, categories, stores, sortOptions, Product } from '../data/products';

const ProductSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All Categories');
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    filterAndSortProducts();
  }, [searchQuery, selectedCategory, selectedStore, priceRange, minRating, sortBy]);

  const filterAndSortProducts = () => {
    let filtered = products.filter(product => {
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
      const matchesStore = selectedStore === 'All Stores' || product.store === selectedStore;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesRating = product.rating >= minRating;

      return matchesSearch && matchesCategory && matchesStore && matchesPrice && matchesRating;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popularity':
        filtered.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const toggleWishlist = (productId: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className={`bg-gray-800 rounded-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 ${
      viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
    }`}>
      <div className={`relative ${viewMode === 'list' ? 'w-full sm:w-48 flex-shrink-0' : ''}`}>
        <img
          src={product.image}
          alt={product.name}
          className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            viewMode === 'list' ? 'h-48 sm:h-full' : 'h-48'
          }`}
        />
        <button
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 bg-gray-900/80 rounded-full backdrop-blur-sm hover:bg-gray-900 transition-colors"
        >
          <Heart
            className={`h-4 w-4 sm:h-5 sm:w-5 ${
              wishlist.has(product.id) ? 'text-red-500 fill-current' : 'text-white'
            }`}
          />
        </button>
        {!product.inStock && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
            Out of Stock
          </div>
        )}
        {product.originalPrice && (
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
            {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>

      <div className={`p-4 sm:p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base sm:text-lg mb-1 group-hover:text-purple-400 transition-colors truncate">
              {product.name}
            </h3>
            <p className="text-gray-400 text-sm">{product.brand}</p>
          </div>
          <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium ml-2 flex-shrink-0">
            {product.store}
          </span>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-400">
            {product.rating} ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{product.description}</p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl sm:text-2xl font-bold text-white">${product.price}</span>
            {product.originalPrice && (
              <span className="text-base sm:text-lg text-gray-400 line-through">${product.originalPrice}</span>
            )}
          </div>
          <button
            disabled={!product.inStock}
            className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm w-full sm:w-auto"
          >
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>View Product</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="mb-6 sm:mb-8">
          <form onSubmit={handleSearch} className="mb-4 sm:mb-6">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, or categories..."
                className="w-full pl-10 sm:pl-12 pr-16 sm:pr-20 py-2.5 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              />
              <button
                type="submit"
                className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-sm"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-gray-800 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Filters</span>
              </button>
              <div className="flex items-center space-x-1 bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-purple-600' : 'hover:bg-gray-700'
                  }`}
                >
                  <Grid className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-purple-600' : 'hover:bg-gray-700'
                  }`}
                >
                  <List className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <span className="text-gray-400 text-sm">
                {filteredProducts.length} results
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Filters</h3>

              {/* Category Filter */}
              <div>
                <h4 className="font-medium mb-3 text-sm sm:text-base">Category</h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Store Filter */}
              <div>
                <h4 className="font-medium mb-3 text-sm sm:text-base">Store</h4>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                >
                  {stores.map(store => (
                    <option key={store} value={store}>{store}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-medium mb-3 text-sm sm:text-base">Price Range</h4>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <span>${priceRange[0]}</span>
                    <span>-</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h4 className="font-medium mb-3 text-sm sm:text-base">Minimum Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1, 0].map(rating => (
                    <label key={rating} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={minRating === rating}
                        onChange={(e) => setMinRating(parseInt(e.target.value))}
                        className="text-purple-600"
                      />
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 sm:h-4 sm:w-4 ${
                              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-xs sm:text-sm text-gray-300">
                          {rating === 0 ? 'All' : `${rating}+ stars`}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className={`grid gap-4 sm:gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 sm:py-16">
                <div className="bg-gray-800 rounded-xl p-6 sm:p-8 max-w-md mx-auto">
                  <SlidersHorizontal className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-gray-400 mb-6 text-sm sm:text-base">
                    Try adjusting your search criteria or filters to find what you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Categories');
                      setSelectedStore('All Stores');
                      setPriceRange([0, 2000]);
                      setMinRating(0);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendation Section */}
        <section className="mt-12 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {mockProducts.slice(0, 4).map(product => (
              <ProductCard key={`rec-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductSearch;