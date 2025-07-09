import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Search, Heart, ShoppingBag, TrendingUp, Star, Eye, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { mockProducts } from '../data/products';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Searches', value: '247', icon: Search, color: 'bg-blue-500' },
    { label: 'Wishlist Items', value: '12', icon: Heart, color: 'bg-red-500' },
    { label: 'Price Alerts', value: '8', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Products Viewed', value: '156', icon: Eye, color: 'bg-purple-500' },
  ];

  const recentSearches = [
    'iPhone 15 Pro',
    'Nike Air Jordan',
    'MacBook Air M3',
    'Sony Headphones',
    'Instant Pot'
  ];

  const priceAlerts = [
    { product: 'iPhone 15 Pro Max', currentPrice: 1199, targetPrice: 1099, change: -5.2 },
    { product: 'MacBook Air M3', currentPrice: 1099, targetPrice: 999, change: 2.1 },
    { product: 'Sony WH-1000XM5', currentPrice: 399, targetPrice: 350, change: -8.3 },
  ];

  return (
    <div className="min-h-screen py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-gray-400 text-sm sm:text-base">Here's your shopping overview and personalized recommendations.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs sm:text-sm">{stat.label}</p>
                  <p className="text-lg sm:text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                  <stat.icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-700 rounded-lg">
                  <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">Searched for "iPhone 15 Pro"</p>
                    <p className="text-xs sm:text-sm text-gray-400">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-700 rounded-lg">
                  <div className="bg-red-500 p-2 rounded-lg flex-shrink-0">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">Added Nike Air Jordan to wishlist</p>
                    <p className="text-xs sm:text-sm text-gray-400">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-700 rounded-lg">
                  <div className="bg-green-500 p-2 rounded-lg flex-shrink-0">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base">Price alert triggered for MacBook Air</p>
                    <p className="text-xs sm:text-sm text-gray-400">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Alerts */}
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Price Alerts</h2>
                <Link to="/alerts" className="text-purple-400 hover:text-purple-300 text-xs sm:text-sm">
                  View All
                </Link>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {priceAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-700 rounded-lg">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{alert.product}</p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Target: ${alert.targetPrice} | Current: ${alert.currentPrice}
                      </p>
                    </div>
                    <div className={`flex items-center space-x-1 ml-2 ${
                      alert.change < 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <TrendingUp className={`h-3 w-3 sm:h-4 sm:w-4 ${alert.change < 0 ? 'rotate-180' : ''}`} />
                      <span className="text-xs sm:text-sm font-medium">{Math.abs(alert.change)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 sm:space-y-8">
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/search"
                  className="flex items-center space-x-3 w-full p-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-sm sm:text-base"
                >
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Search Products</span>
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center space-x-3 w-full p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm sm:text-base"
                >
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>View Wishlist</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 w-full p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors text-sm sm:text-base"
                >
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Update Profile</span>
                </Link>
              </div>
            </div>

            {/* Recent Searches */}
            <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Recent Searches</h2>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <Link
                    key={index}
                    to={`/search?q=${encodeURIComponent(search)}`}
                    className="block p-2 rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm text-gray-300 hover:text-white"
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="truncate">{search}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <section className="mt-8 sm:mt-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Recommended for You</h2>
            <Link to="/search" className="text-purple-400 hover:text-purple-300 text-sm sm:text-base">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {mockProducts.slice(0, 4).map(product => (
              <div key={product.id} className="bg-gray-800 rounded-xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-36 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                    {product.store}
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold mb-1 group-hover:text-purple-400 transition-colors text-sm sm:text-base truncate">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-2">{product.brand}</p>
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
                    <span className="text-xs sm:text-sm text-gray-400">{product.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-bold">${product.price}</span>
                    <Link
                      to={`/product/${product.id}`}
                      className="text-purple-400 hover:text-purple-300 text-xs sm:text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;