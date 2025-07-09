import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                ShopSenseAI
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Revolutionizing online shopping with AI-powered product discovery and smart recommendations across multiple stores.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm sm:text-base">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Home
              </Link>
              <Link to="/search" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Product Search
              </Link>
              <Link to="/about" className="block text-gray-400 hover:text-white transition-colors text-sm">
                About Us
              </Link>
              <Link to="/contact" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm sm:text-base">Legal</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                Cookie Policy
              </a>
              <a href="#" className="block text-gray-400 hover:text-white transition-colors text-sm">
                GDPR Compliance
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm sm:text-base">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 flex-shrink-0" />
                <span className="break-all">support@shopsenseai.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400 flex-shrink-0" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            © 2024 ShopSenseAI. All rights reserved. Powered by AI-driven shopping intelligence.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;