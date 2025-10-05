import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, Search, Filter, Star, Heart, MapPin, User, Grid, List, Plus, Minus, X, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Products() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationSort, setLocationSort] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showFarmerContact, setShowFarmerContact] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/categories')
        ]);
        setProducts(productsRes.data);
        setFilteredProducts(productsRes.data);
        setCategories(categoriesRes.data);
        
        // Load cart from localStorage
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
        
        // Load wishlist from localStorage
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
        
        // Get user location for sorting
        getUserLocation();
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [searchTerm, selectedCategory, sortBy, priceRange, products, locationSort, userLocation]);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    // Save wishlist to localStorage whenever it changes
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, using default location (Mumbai)');
          setUserLocation({ lat: 19.0760, lng: 72.8777 }); // Mumbai coordinates
        }
      );
    } else {
      setUserLocation({ lat: 19.0760, lng: 72.8777 }); // Mumbai coordinates
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.farmer_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category_id == selectedCategory);
    }

    // Price range filter
    if (priceRange.min !== '') {
      filtered = filtered.filter(product => product.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(product => product.price <= parseFloat(priceRange.max));
    }

    // Add distance calculation for location-based sorting
    if (userLocation && locationSort) {
      filtered = filtered.map(product => ({
        ...product,
        distance: calculateDistance(
          userLocation.lat, 
          userLocation.lng, 
          product.farmer_lat || 19.0760, 
          product.farmer_lng || 72.8777
        )
      }));
    }

    // Sorting
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'stock':
        filtered.sort((a, b) => b.stock_quantity - a.stock_quantity);
        break;
      case 'location':
        if (userLocation && locationSort) {
          filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      if (newCart[product.id]) {
        newCart[product.id].quantity += 1;
      } else {
        newCart[product.id] = {
          ...product,
          quantity: 1
        };
      }
      // Save to localStorage
      localStorage.setItem('shoppingCart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      delete newCart[productId];
      // Save to localStorage
      localStorage.setItem('shoppingCart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => {
      const newCart = ({
        ...prevCart,
        [productId]: {
          ...prevCart[productId],
          quantity
        }
      });
      // Save to localStorage
      localStorage.setItem('shoppingCart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, item) => total + item.quantity, 0);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('newest');
    setPriceRange({ min: '', max: '' });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory) count++;
    if (priceRange.min !== '' || priceRange.max !== '') count++;
    return count;
  };

  const proceedToCheckout = () => {
    if (!isAuthenticated) {
      alert('Please login to proceed with checkout');
      return;
    }
    // Navigate to checkout page using React Router
    navigate('/checkout');
  };

  // Wishlist functions
  const addToWishlist = (product) => {
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) {
        return prev.filter(item => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlist.find(item => item.id === productId);
  };

  // Farmer contact functions
  const showFarmerContactModal = (product) => {
    setSelectedFarmer({
      name: product.farmer_name,
      city: product.farmer_city,
      state: product.farmer_state,
      phone: product.farmer_phone || 'Contact not available',
      email: product.farmer_email || 'Email not available'
    });
    setShowFarmerContact(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <div className="text-red-600 text-xl mb-4">Error Loading Products</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Cart */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
                              <h1 className="text-3xl font-bold text-gray-900 mb-2">Fresh Farm Products - UPDATED</h1>
                  <p className="text-gray-600">Discover fresh, organic products directly from local farmers - NEW VERSION</p>
          </div>
          
          {/* Shopping Cart and Wishlist Icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist Icon */}
            <button
              onClick={() => setShowWishlist(!showWishlist)}
              className="relative p-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition-colors"
            >
              <Heart className="h-6 w-6" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
            
            {/* Shopping Cart Icon */}
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Shopping Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white w-96 h-full shadow-xl overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Shopping Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {Object.keys(cart).length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.values(cart).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <img
                          src={item.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNy41IDIwTDIwIDIyLjVMMjIuNSAyMEgyMVYxMEgxOVYyMEgxNy41WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4='}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <p className="text-green-600 font-semibold">₹{item.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-xl text-green-600">₹{getCartTotal().toFixed(2)}</span>
                      </div>
                      <button
                        onClick={proceedToCheckout}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Sidebar */}
        {showWishlist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white w-96 h-full shadow-xl overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">My Wishlist</h2>
                  <button
                    onClick={() => setShowWishlist(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {wishlist.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Your wishlist is empty</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wishlist.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                        <img
                          src={item.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNy41IDIwTDIwIDIyLjVMMjIuNSAyMEgyMVYxMEgxOVYyMEgxNy41WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4='}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <p className="text-green-600 font-semibold">₹{item.price}</p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => addToCart(item)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => removeFromWishlist(item.id)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, farmers, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
                <option value="stock">Stock: High to Low</option>
                <option value="location">Nearest to You</option>
              </select>
            </div>

            {/* Location Sort Toggle */}
            <div className="flex items-center">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={locationSort}
                  onChange={(e) => setLocationSort(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Location Sort</span>
              </label>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Price Range:</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Summary and View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 text-green-600">
                (filtered by {getActiveFiltersCount()} criteria)
              </span>
            )}
            {locationSort && userLocation && (
              <span className="ml-2 text-blue-600">
                • Sorted by distance from your location
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-4">
              {getActiveFiltersCount() > 0 
                ? 'Try adjusting your search criteria or filters.'
                : 'Check back later for fresh farm products.'
              }
            </p>
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={clearFilters}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <div key={product.id} className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${
                viewMode === 'list' ? 'flex' : ''
              }`}>
                {/* Product Image */}
                <div className={`relative ${viewMode === 'list' ? 'w-48 h-48' : 'h-48'} bg-gray-100`}>
                  {product.images && product.images.length > 0 ? (
                    <div className="relative h-full">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTUwTDIwMCAxNzVMMjI1IDE1MEgyMTJWMTAwSDE4OFYxNTBIMTc1WiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjIxMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjc3NDhDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBVbmF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
                        }}
                      />
                      {product.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                          +{product.images.length - 1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-colors ${
                      isInWishlist(product.id) 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* Distance Badge */}
                  {locationSort && product.distance && (
                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {product.distance.toFixed(1)} km
                    </div>
                  )}
                </div>
                
                {/* Product Details */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">
                      {product.name}
                    </h3>
                    {product.name_hindi && (
                      <p className="text-sm text-gray-600 mb-2 truncate">{product.name_hindi}</p>
                    )}
                    <p className={`text-sm text-gray-600 overflow-hidden text-ellipsis ${
                      viewMode === 'list' ? 'line-clamp-3' : 'line-clamp-2'
                    }`}>
                      {product.description || 'No description available'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                      <span className="text-sm text-gray-500 ml-1">per {product.unit}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Stock</div>
                      <div className="font-medium text-gray-900">{product.stock_quantity}</div>
                    </div>
                  </div>
                  
                  {/* Farmer Information */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span className="truncate">{product.farmer_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{product.farmer_city}, {product.farmer_state}</span>
                    </div>
                  </div>

                  {/* Rating and Reviews Placeholder */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">(4.5 • 12 reviews)</span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 mb-2">
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.status !== 'active'}
                      className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </button>
                    
                    <Link 
                      to={`/products/${product.id}`} 
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </Link>
                  </div>
                  

          </div>
        </div>
      ))}
          </div>
        )}
      </div>

      {/* Farmer Contact Modal */}
      {showFarmerContact && selectedFarmer && (
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
                  <p className="font-medium">{selectedFarmer.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{selectedFarmer.city}, {selectedFarmer.state}</p>
                </div>
              </div>
              
              {selectedFarmer.phone !== 'Contact not available' && (
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 text-green-600">📞</div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedFarmer.phone}</p>
                  </div>
                </div>
              )}
              
              {selectedFarmer.email !== 'Email not available' && (
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 text-blue-600">✉️</div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedFarmer.email}</p>
                  </div>
                </div>
              )}
              
              {selectedFarmer.phone === 'Contact not available' && selectedFarmer.email === 'Email not available' && (
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


