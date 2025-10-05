import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Footer = () => {
  const { isAuthenticated, user } = useAuth();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">உழவர் சந்தை</span>
            </Link>
            <p className="text-gray-300 mb-4 max-w-md">
              Empowering Indian farmers by connecting them directly with buyers across the nation. 
              Fresh produce, fair prices, sustainable agriculture.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span>+91 1800-123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>support@kisanmarket.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>Pan India Service</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <div className="space-y-2">
              {/* Only show Browse Products for non-authenticated users or buyers */}
              {(!isAuthenticated || user?.role === 'buyer') && (
                <Link to="/products" className="block text-gray-300 hover:text-white transition-colors">
                  Browse Products
                </Link>
              )}
              <Link to="/register" className="block text-gray-300 hover:text-white transition-colors">
                Become a Seller
              </Link>
              <Link to="/login" className="block text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <div className="space-y-2">
              <span className="block text-gray-300">Vegetables</span>
              <span className="block text-gray-300">Fruits</span>
              <span className="block text-gray-300">Grains</span>
              <span className="block text-gray-300">Pulses</span>
              <span className="block text-gray-300">Spices</span>
              <span className="block text-gray-300">Dairy</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 உழவர் சந்தை. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;