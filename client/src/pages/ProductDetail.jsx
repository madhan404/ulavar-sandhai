import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingCart, Package, MapPin, User, Calendar, Heart, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
const apiUrl = import.meta.env.VITE_URL_API || 'http://localhost:3000';
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [showFarmerContact, setShowFarmerContact] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(`${apiUrl}/api/products/${id}`);
        setProduct(data);
        
        // Load wishlist from localStorage
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  // Wishlist functions
  const addToWishlist = (product) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev.filter(item => item.id !== product.id);
      } else {
        const newWishlist = [...prev, product];
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        return newWishlist;
      }
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => {
      const newWishlist = prev.filter(item => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.find(item => item.id === productId);
  };

  // Cart functions
  const addToCart = (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    
    const currentCart = JSON.parse(localStorage.getItem('shoppingCart') || '{}');
    
    if (currentCart[product.id]) {
      currentCart[product.id].quantity += 1;
    } else {
      currentCart[product.id] = {
        ...product,
        quantity: 1
      };
    }
    
    localStorage.setItem('shoppingCart', JSON.stringify(currentCart));
    toast.success('Product added to cart!');
  };

  // Farmer contact functions
  const showFarmerContactModal = () => {
    setShowFarmerContact(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <div className="text-red-600 text-xl mb-4">
            {error || 'Product not found'}
          </div>
          <Link 
            to="/products"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const hasImages = product.images && product.images.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/products"
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                {hasImages ? (
                  <img
                    src={product.images[selectedImageIndex]}
                    alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNzUgMjAwTDMwMCAyNTBMMzI1IDIwMEgzMTJWMTAwSDI4OFYyMDBIMjc1WiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIzMDAiIHk9IjI4MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjIwIiBmaWxsPSIjNjc3NDhDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBVbmF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-24 w-24 text-gray-300" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    product.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : product.status === 'out_of_stock'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status === 'active' ? 'In Stock' : 
                     product.status === 'out_of_stock' ? 'Out of Stock' : 
                     product.status}
                  </span>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => addToWishlist(product)}
                  className={`absolute top-4 right-4 p-2 rounded-full shadow-md transition-colors ${
                    isInWishlist(product.id) 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Thumbnail Images */}
              {hasImages && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === selectedImageIndex
                          ? 'border-green-500 ring-2 ring-green-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSA0MEw0MCA1MEw0NSA0MEg0MlYyMEgzOFY0MEgzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iNDAiIHk9IjYwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2Nzc0OEMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                {product.name_hindi && (
                  <p className="text-lg text-gray-600 mb-3">{product.name_hindi}</p>
                )}
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-green-600">₹{product.price}</span>
                  <span className="text-lg text-gray-500">per {product.unit}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>

              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Stock</p>
                    <p className="font-medium text-gray-900">{product.stock_quantity}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Min Order</p>
                    <p className="font-medium text-gray-900">{product.min_order_quantity} {product.unit}</p>
                  </div>
                </div>
              </div>

              {/* Farmer Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Farmer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{product.farmer_name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{product.farmer_city}, {product.farmer_state}</span>
                  </div>
                  {product.farmer_phone && (
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-400">📞</span>
                      <span className="text-gray-700">{product.farmer_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-700">{product.category_name}</span>
                    {product.category_name_hindi && (
                      <span className="text-gray-500">({product.category_name_hindi})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button 
                  onClick={() => addToCart(product)}
                  disabled={product.status !== 'active'}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
                <button 
                  onClick={showFarmerContactModal}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <User className="h-5 w-5" />
                  <span>Contact Farmer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Farmer Contact Modal */}
      {showFarmerContact && product && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Farmer Contact Information</h3>
              <button 
                onClick={() => setShowFarmerContact(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{product.farmer_name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{product.farmer_city}, {product.farmer_state}</p>
                </div>
              </div>
              
              {product.farmer_phone && (
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 text-green-600">📞</div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{product.farmer_phone}</p>
                  </div>
                </div>
              )}
              
              {product.farmer_email && (
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 text-blue-600">✉️</div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{product.farmer_email}</p>
                  </div>
                </div>
              )}
              
              {product.pickup_address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-500">Pickup Address</p>
                    <p className="font-medium">{product.pickup_address}</p>
                  </div>
                </div>
              )}
              
              {!product.farmer_phone && !product.farmer_email && !product.pickup_address && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">
                    Contact information not available for this farmer.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <button
                onClick={() => setShowFarmerContact(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


