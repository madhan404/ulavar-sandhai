import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  Heart, 
  Settings, 
  ShoppingBag,
  Truck,
  CheckCircle,
  Clock,
  Star,
  Edit,
  Plus,
  Trash2,
  Eye,
  Phone,
  Mail,
  Calendar,
  Navigation,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';

const apiUrl = import.meta.env.VITE_URL_API || 'http://localhost:3000';

export default function BuyerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderTracking, setOrderTracking] = useState(null);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    default_address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [addressForm, setAddressForm] = useState({
    address: '',
    city: '',
    state: '',
    pincode: '',
    type: 'Home'
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'buyer') {
      fetchData();
      
      // Set up periodic refresh every 30 seconds to get real-time updates
      const interval = setInterval(fetchData, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, profileRes, addressesRes] = await Promise.all([
        axios.get(`${apiUrl}/api/orders/buyer/my-orders`),
        axios.get(`${apiUrl}/api/buyers/profile`),
        axios.get(`${apiUrl}/api/buyers/addresses`)
      ]);
      
      // Check for status changes in orders
      const newOrders = ordersRes.data;
      if (orders.length > 0) {
        newOrders.forEach(newOrder => {
          const oldOrder = orders.find(o => o.id === newOrder.id);
          if (oldOrder && oldOrder.status !== newOrder.status) {
            toast.success(`Order #${newOrder.order_number} status updated to ${newOrder.status}!`);
          }
        });
      }
      
      setOrders(newOrders);
      setProfile(profileRes.data);
      setAddresses(addressesRes.data);
      
      // Load wishlist from localStorage
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      // Only send the fields that can be updated
      const updateData = {
        default_address: profileForm.default_address,
        city: profileForm.city,
        state: profileForm.state,
        pincode: profileForm.pincode
      };
      
      await axios.patch(`${apiUrl}/api/buyers/profile`, updateData);
      
      // Update local profile state
      setProfile(prev => ({ 
        ...prev, 
        default_address: profileForm.default_address,
        city: profileForm.city,
        state: profileForm.state,
        pincode: profileForm.pincode
      }));
      
      setShowProfileModal(false);
      toast?.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast?.error(err.response?.data?.error || 'Failed to update profile');
    }
  };


  const addAddress = async () => {
    try {
      await axios.post(`${apiUrl}/api/buyers/addresses`, addressForm);
      
      // Refresh addresses after adding
      const addressesRes = await axios.get(`${apiUrl}/api/buyers/addresses`);
      setAddresses(addressesRes.data);
      
      setShowAddressModal(false);
      setAddressForm({ address: '', city: '', state: '', pincode: '', type: 'Home' });
      toast?.success('Address added successfully!');
    } catch (err) {
      console.error('Error adding address:', err);
      toast?.error(err.response?.data?.error || 'Failed to add address');
    }
  };

  const trackOrder = async (orderId) => {
    try {
      const response = await axios.get(`${apiUrl}/api/orders/${orderId}/status`);
      setOrderTracking(response.data);
      setSelectedOrder(orders.find(o => o.id === orderId));
      setShowTrackingModal(true);
    } catch (err) {
      console.error('Error fetching order tracking:', err);
      toast?.error('Failed to fetch order tracking');
    }
  };

  // Wishlist functions
  const removeFromWishlist = (productId) => {
    setWishlist(prev => {
      const newWishlist = prev.filter(item => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      return newWishlist;
    });
  };

  const addToCartFromWishlist = (product) => {
    // Get current cart from localStorage
    const currentCart = JSON.parse(localStorage.getItem('shoppingCart') || '{}');
    
    if (currentCart[product.id]) {
      currentCart[product.id].quantity += 1;
    } else {
      currentCart[product.id] = {
        ...product,
        quantity: 1
      };
    }
    
    // Save updated cart
    localStorage.setItem('shoppingCart', JSON.stringify(currentCart));
    
    // Remove from wishlist
    removeFromWishlist(product.id);
    
    toast?.success('Product added to cart!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'placed': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'placed': return <Clock className="w-4 h-4" />;
      case 'accepted': return <Package className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getOrderStats = () => {
    const total = orders.length;
    const delivered = orders.filter(o => o.status === 'delivered').length;
    const inProgress = orders.filter(o => ['placed', 'accepted', 'shipped'].includes(o.status)).length;
    const cancelled = orders.filter(o => o.status === 'cancelled').length;
    
    return { total, delivered, inProgress, cancelled };
  };

  if (!isAuthenticated || user?.role !== 'buyer') {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600">You must be logged in as a buyer to access this dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Error</h1>
        <p className="text-gray-600">{error}</p>
        <button onClick={fetchData} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mt-4">Retry</button>
      </div>
    );
  }

  const stats = getOrderStats();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.name || user?.name}! 👋
        </h1>
        <p className="text-gray-600">Manage your orders, profile, and shopping preferences</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
        {[
          { id: 'overview', label: 'Overview', icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'orders', label: 'My Orders', icon: <Package className="w-4 h-4" /> },
          { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
          { id: 'addresses', label: 'Addresses', icon: <MapPin className="w-4 h-4" /> },
          { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.delivered}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <Truck className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.inProgress}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.cancelled}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {orders.slice(0, 3).map(order => (
                <div key={order.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {order.images && order.images.length > 0 ? (
                        <img 
                          src={order.images[0]} 
                          alt={order.product_name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAzMkwzMiAzNkwzNiAzMkg0NFYyNEgyMFYzMkgyOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMzIiIHk9IjQ4IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2Nzc0OEMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{order.product_name}</h3>
                        <p className="text-sm text-gray-600">Order #{order.order_number}</p>
                        <p className="text-sm text-gray-600">₹{order.total_amount}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                      </span>
                      <button 
                        onClick={() => setActiveTab('orders')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">My Orders</h2>
            <div className="flex space-x-2">
              <button
                onClick={fetchData}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                <option>All Orders</option>
                <option>Recent</option>
                <option>Delivered</option>
                <option>In Progress</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {order.images && order.images.length > 0 ? (
                      <img 
                        src={order.images[0]} 
                        alt={order.product_name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSA0MEw0MCA1MEw0NSA0MEg0MlYyMEgzOFY0MEgzNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iNDAiIHk9IjYwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM2Nzc0OEMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlPC90ZXh0Pgo8L3N2Zz4=';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-10 h-10 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-lg">{order.product_name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{order.product_description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Order #:</span> {order.order_number}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Quantity:</span> {order.quantity} {order.unit}
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Total:</span> ₹{order.total_amount}
                        </div>
            <div>
                          <span className="font-medium text-gray-700">Date:</span> {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      {/* Farmer Information */}
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-700">Farmer Details</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>{order.farmer_name}</div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-3 h-3" />
                            <span>{order.farmer_phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3 h-3" />
                            <span>{order.farmer_city}, {order.farmer_state}</span>
                          </div>
                        </div>
                      </div>

                      {/* Logistics Information */}
                      {order.logistics_status && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Truck className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-700">Delivery Status</span>
                          </div>
                          <div className="text-sm text-blue-600 space-y-1">
                            {order.courier_name && <div>Courier: {order.courier_name}</div>}
                            {order.tracking_number && <div>Tracking: {order.tracking_number}</div>}
                            {order.estimated_delivery && (
                              <div>Estimated: {new Date(order.estimated_delivery).toLocaleDateString()}</div>
                            )}
                            <div className="font-medium">Status: {order.logistics_status}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2 capitalize">{order.status.replace('_', ' ')}</span>
                    </span>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => trackOrder(order.id)}
                        className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Track
                      </button>
                      <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-50">
                        <Star className="w-4 h-4 mr-1" />
                        Review
                      </button>
                    </div>
                  </div>
            </div>
          </div>
        ))}
      </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Profile Information</h2>
            <button 
              onClick={() => {
                setProfileForm({
                  name: profile?.name || user?.name || '',
                  email: profile?.email || user?.email || '',
                  phone: profile?.phone || user?.phone || '',
                  default_address: profile?.default_address || '',
                  city: profile?.city || '',
                  state: profile?.state || '',
                  pincode: profile?.pincode || ''
                });
                setShowProfileModal(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-gray-900">{profile?.name || user?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{profile?.email || user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{profile?.phone || user?.phone}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Default Address</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="text-gray-900">{profile?.default_address || 'No address set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <p className="text-gray-900">{profile?.city || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <p className="text-gray-900">{profile?.state || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                    <p className="text-gray-900">{profile?.pincode || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Saved Addresses</h2>
            <button 
              onClick={() => setShowAddressModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map(address => (
              <div key={address.id} className="bg-white rounded-lg shadow p-6 border-2 border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-900">{address.type}</span>
                    {address.is_default && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-gray-700">
                  <p>{address.address}</p>
                  <p>{address.city}, {address.state} - {address.pincode}</p>
                </div>
              </div>
            ))}
            
            {addresses.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                <p className="text-gray-600 mb-4">Add your first delivery address to get started</p>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">My Wishlist ({wishlist.length})</h3>
            </div>
            
            {wishlist.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-600">Start adding products to your wishlist from the products page</p>
                <Link 
                  to="/products"
                  className="inline-block mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((product) => (
                    <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Product Image */}
                      <div className="relative h-48 bg-gray-100">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTUwTDIwMCAxNzVMMjI1IDE1MEgyMTJWMTAwSDE4OFYxNTBIMTc1WiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjIxMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjc3NDhDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBVbmF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-16 w-16 text-gray-300" />
                          </div>
                        )}
                        
                        {/* Remove from Wishlist Button */}
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Product Details */}
                      <div className="p-4">
                        <h4 className="font-semibold text-lg text-gray-900 mb-2 truncate">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description || 'No description available'}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-xl font-bold text-green-600">₹{product.price}</span>
                            <span className="text-sm text-gray-500 ml-1">per {product.unit}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Stock</div>
                            <div className="font-medium text-gray-900">{product.stock_quantity}</div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => addToCartFromWishlist(product)}
                            disabled={product.status !== 'active'}
                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            Add to Cart
                          </button>
                          
                          <Link 
                            to={`/products/${product.id}`}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Profile</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Address</label>
                <textarea
                  value={profileForm.default_address}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, default_address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={profileForm.state}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={profileForm.pincode}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateProfile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Add Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Address</h3>
              <button 
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                <select
                  value={addressForm.type}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <textarea
                  value={addressForm.address}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter your complete address"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddressModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addAddress}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Address
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracking Modal */}
      {showTrackingModal && orderTracking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Order Tracking</h3>
              <button 
                onClick={() => setShowTrackingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {selectedOrder && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Order #{selectedOrder.order_number}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Product:</span> {selectedOrder.product_name}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Quantity:</span> {selectedOrder.quantity} {selectedOrder.unit}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Total:</span> ₹{selectedOrder.total_amount}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking Timeline */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Order Timeline</h4>
              {orderTracking.timeline && orderTracking.timeline.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">{event.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{event.title}</h5>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Logistics Information */}
            {orderTracking.logisticsStatus && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">Delivery Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-700">Status:</span> {orderTracking.logisticsStatus}
                  </div>
                  {orderTracking.order.courier_name && (
                    <div>
                      <span className="font-medium text-blue-700">Courier:</span> {orderTracking.order.courier_name}
                    </div>
                  )}
                  {orderTracking.order.tracking_number && (
                    <div>
                      <span className="font-medium text-blue-700">Tracking:</span> {orderTracking.order.tracking_number}
                    </div>
                  )}
                  {orderTracking.order.estimated_delivery && (
                    <div>
                      <span className="font-medium text-blue-700">Estimated Delivery:</span> 
                      {new Date(orderTracking.order.estimated_delivery).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}