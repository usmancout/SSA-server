import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, ShoppingBag, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1.5 sm:p-2 rounded-lg group-hover:scale-105 transition-transform">
              <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hidden xs:block">
              ShopSenseAI
            </span>
            <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent xs:hidden">
              SSA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link
              to="/"
              className={`transition-colors text-sm xl:text-base ${
                isActive('/') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/search"
              className={`transition-colors text-sm xl:text-base ${
                isActive('/search') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Search
            </Link>
            <Link
              to="/about"
              className={`transition-colors text-sm xl:text-base ${
                isActive('/about') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`transition-colors text-sm xl:text-base ${
                isActive('/contact') ? 'text-purple-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 bg-gray-700 rounded-full p-1.5 sm:p-2 hover:bg-gray-600 transition-colors"
                >
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover"
                  />
                  <span className="hidden md:block text-xs sm:text-sm max-w-20 truncate">{user?.name}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
                    <Link
                      to="/dashboard"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Wishlist</span>
                    </Link>
                    {user?.isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <hr className="my-1 border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  to="/signin"
                  className="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-purple-600 hover:bg-purple-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-3 sm:py-4 space-y-1 sm:space-y-2 border-t border-gray-700 mt-2">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive('/') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/search"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive('/search') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Search
            </Link>
            <Link
              to="/about"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive('/about') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive('/contact') ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              Contact
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;