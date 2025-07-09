import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Shield, Zap, Star, ArrowRight, Play } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const categories = [
    { name: 'Electronics', icon: '📱', color: 'from-blue-500 to-cyan-500' },
    { name: 'Fashion', icon: '👕', color: 'from-pink-500 to-rose-500' },
    { name: 'Home & Garden', icon: '🏡', color: 'from-green-500 to-emerald-500' },
    { name: 'Books', icon: '📚', color: 'from-purple-500 to-violet-500' },
    { name: 'Sports', icon: '⚽', color: 'from-orange-500 to-amber-500' },
    { name: 'Beauty', icon: '💄', color: 'from-red-500 to-pink-500' },
  ];

  const features = [
    {
      icon: <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8" />,
      title: 'AI-Powered Recommendations',
      description: 'Get personalized product suggestions based on your preferences and shopping history.',
    },
    {
      icon: <Shield className="h-6 w-6 sm:h-8 sm:w-8" />,
      title: 'Price Comparison',
      description: 'Compare prices across multiple stores to ensure you get the best deals available.',
    },
    {
      icon: <Zap className="h-6 w-6 sm:h-8 sm:w-8" />,
      title: 'Real-time Updates',
      description: 'Stay informed with live price changes, stock availability, and exclusive offers.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 5,
      comment: 'ShopSenseAI has completely transformed how I shop online. The recommendations are spot-on!',
    },
    {
      name: 'Mike Chen',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 5,
      comment: 'Saved me hundreds of dollars with accurate price comparisons. Highly recommended!',
    },
    {
      name: 'Emily Rodriguez',
      avatar: 'https://images.pexels.com/photos/1462630/pexels-photo-1462630.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 5,
      comment: 'The AI recommendations helped me discover products I never knew I needed. Amazing platform!',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 sm:space-y-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Smart Shopping
              </span>
              <br />
              <span className="text-white">Made Simple</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Discover the best products across multiple stores with our AI-powered platform. 
              Compare prices, get personalized recommendations, and never miss a great deal again.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-4">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands, or categories..."
                  className="w-full pl-10 sm:pl-12 pr-20 sm:pr-32 py-3 sm:py-4 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                />
                <button
                  type="submit"
                  className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 hover:bg-purple-700 px-3 sm:px-6 py-1.5 sm:py-2 rounded-full transition-colors text-sm sm:text-base"
                >
                  Search
                </button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6 px-4">
              <Link
                to="/signup"
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 px-6 sm:px-8 py-3 rounded-full font-semibold transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <button className="w-full sm:w-auto flex items-center justify-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                <Play className="h-4 w-4 sm:h-5 sm:w-5 bg-white text-gray-900 rounded-full p-1" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/search?category=${encodeURIComponent(category.name)}`}
                className="group"
              >
                <div className={`bg-gradient-to-r ${category.color} p-4 sm:p-6 rounded-2xl text-center transform group-hover:scale-105 group-hover:shadow-xl transition-all duration-300`}>
                  <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{category.icon}</div>
                  <h3 className="text-white font-semibold text-xs sm:text-sm lg:text-base">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Choose ShopSenseAI?</h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
              Our advanced AI technology and comprehensive marketplace integration deliver an unmatched shopping experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-800 p-6 sm:p-8 rounded-2xl text-center group hover:bg-gray-750 transition-all duration-300">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-gray-400 text-base sm:text-lg">Join thousands of satisfied customers who've transformed their shopping experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-900 p-4 sm:p-6 rounded-2xl">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover mr-3 sm:mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">{testimonial.name}</h4>
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 italic text-sm sm:text-base">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Transform Your Shopping?</h2>
          <p className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of smart shoppers who save time and money with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6">
            <Link
              to="/signup"
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 px-6 sm:px-8 py-3 rounded-full font-semibold transition-colors text-sm sm:text-base"
            >
              Start Shopping Smart
            </Link>
            <Link
              to="/search"
              className="w-full sm:w-auto border border-gray-600 hover:border-purple-500 px-6 sm:px-8 py-3 rounded-full font-semibold transition-colors text-sm sm:text-base"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;