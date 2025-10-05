import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, ArrowRight, Shield, Sprout } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Fresh Produce
              <span className="text-green-600"> Direct from Farmers</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect directly with local farmers. Buy fresh, organic produce at fair prices. 
              Support local agriculture and get the best quality food for your family.
            </p>
            
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/buyer-login" className="btn bg-green-600 hover:bg-green-700 text-white btn-lg inline-flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Buy Fresh Produce</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/farmer-login" className="btn bg-green-600 hover:bg-green-700 text-white btn-lg inline-flex items-center space-x-2">
                  <Sprout className="w-5 h-5" />
                  <span>Farmer Login</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/staff-login" className="btn bg-blue-600 hover:bg-blue-700 text-white btn-lg inline-flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Admin Login</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={`/dashboard/${user?.role}`} className="btn bg-green-600 hover:bg-green-700 text-white btn-lg">
                  Go to Dashboard
                </Link>
                {/* Only show Browse Products for buyers */}
                {user?.role === 'buyer' && (
                  <Link to="/products" className="btn btn-outline btn-lg">
                    Browse Products
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Kisan Market?</h2>
            <p className="text-xl text-gray-600">Direct farm-to-table experience with quality assurance</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fresh from Farm</h3>
              <p className="text-gray-600">Get produce directly from local farmers, ensuring maximum freshness and quality.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fair Prices</h3>
              <p className="text-gray-600">Eliminate middlemen. Farmers get better prices, you pay less for quality produce.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assured</h3>
              <p className="text-gray-600">All products are verified for quality and safety before reaching your doorstep.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-green-100 mb-8">Join thousands of customers and farmers already using Kisan Market</p>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn bg-white text-green-600 hover:bg-gray-100 btn-lg">
                Create Account
              </Link>
              <Link to="/products" className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-green-600">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={`/dashboard/${user?.role}`} className="btn bg-white text-green-600 hover:bg-gray-100 btn-lg">
                Go to Dashboard
              </Link>
              {/* Only show Browse Products for buyers */}
              {user?.role === 'buyer' && (
                <Link to="/products" className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-green-600">
                  Browse Products
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}