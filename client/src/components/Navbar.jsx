import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-14 h-14 rounded-lg flex items-center justify-center">
               {/* bg-green-600 */}
              {/* <span className="text-white font-bold text-lg">U</span> */}
              <img src="/farmer.png" alt="Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <span className="text-xl font-bold text-gray-900">உழவர் சந்தை </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
              Home
            </Link>
            {/* Only show Products link for non-authenticated users or buyers */}
            {(!isAuthenticated || user?.role === 'buyer') && (
              <Link to="/products" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Products
              </Link>
            )}
            {isAuthenticated && (
              <Link to={`/dashboard/${user?.role}`} className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/buyer-login" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                  Buyer Login
                </Link>
                <Link to="/farmer-login" className="text-gray-700 hover:text-green-600 font-medium transition-colors">
                  Farmer Login
                </Link>
                <Link to="/staff-login" className="btn bg-blue-600 hover:bg-blue-700 text-white btn-sm">
                  Admin Login
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {user?.name} ({user?.role})
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}