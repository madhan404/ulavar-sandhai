import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Package, ShoppingCart, DollarSign, User, MapPin, Phone, Mail, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import Settings from '../../components/Settings';

const apiUrl = import.meta.env.VITE_URL_API || 'http://localhost:3000';

export default function FarmerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [farmerProfile, setFarmerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    unit: 'kg',
    stock_quantity: '',
  });
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'farmer') {
      setLoading(false);
      setError('Authentication required. Please log in as a farmer.');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('FarmerDashboard: Starting to fetch data for farmer:', user.name);
        
        // Fetch categories separately since it's a public endpoint
        try {
          console.log('FarmerDashboard: About to fetch categories...');
          const { data: cats } = await axios.get(`${apiUrl}/api/categories`);
          console.log('FarmerDashboard: Categories received:', cats.length);
          setCategories(cats);
        } catch (catError) {
          console.error('Error fetching categories:', catError);
          toast.error('Failed to fetch categories: ' + (catError.response?.data?.error || catError.message));
          setCategories([]);
        }
        
        // Fetch farmer-specific data
        try {
          const [{ data: myProducts }, { data: myOrders }, { data: profile }] = await Promise.all([
            axios.get(`${apiUrl}/api/products/farmer/my-products`),
            axios.get(`${apiUrl}/api/orders/farmer/my-orders`),
            axios.get(`${apiUrl}/api/farmers/profile`),
          ]);
          setProducts(myProducts);
          setOrders(myOrders);
          setFarmerProfile(profile);
          console.log('FarmerDashboard: Data loaded successfully');
        } catch (farmerError) {
          console.error('Error fetching farmer data:', farmerError);
          if (farmerError.response?.status === 401) {
            setError('Authentication expired. Please log in again.');
          } else {
            setError('Failed to load farmer data. Please try again.');
          }
          setProducts([]);
          setOrders([]);
          setFarmerProfile(null);
        }
      } catch (e) {
        console.error('Error in main data fetch:', e);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  // Debug: Monitor categories state changes
  useEffect(() => {
    console.log('FarmerDashboard: Categories state changed to:', categories.length);
  }, [categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category_id || !form.price || !form.stock_quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        category_id: Number(form.category_id),
        name: form.name,
        description: form.description,
        price: Number(form.price),
        unit: form.unit,
        stock_quantity: Number(form.stock_quantity),
      };
      await axios.post(`${apiUrl}/api/products`, payload);
      
      // Refresh products
      const { data } = await axios.get(`${apiUrl}/api/products/farmer/my-products`);
      setProducts(data);
      
      // Reset form
      setForm({ category_id: '', name: '', description: '', price: '', unit: 'kg', stock_quantity: '' });
      setShowAddForm(false);
      
      toast.success('Product created successfully!');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({ category_id: '', name: '', description: '', price: '', unit: 'kg', stock_quantity: '' });
    setShowAddForm(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading farmer dashboard...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated || user?.role !== 'farmer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 text-6xl mb-4">🔒</div>
          <div className="text-red-600 text-xl mb-4">Access Denied</div>
          <p className="text-gray-600 mb-6">You must be logged in as a farmer to access this dashboard.</p>
          <button 
            onClick={() => window.location.href = '/farmer-login'}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <div className="text-red-600 text-xl mb-4">Error Loading Dashboard</div>
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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Header with Farmer Profile */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}! 👨‍🌾</h1>
            <p className="text-gray-600">Manage your products and track your orders</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showAddForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {/* Farmer Profile Information */}
        {farmerProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{farmerProfile.name}</p>
                <p className="text-xs text-gray-500">Farmer</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{farmerProfile.city}, {farmerProfile.state}</p>
                <p className="text-xs text-gray-500">Location</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{farmerProfile.phone}</p>
                <p className="text-xs text-gray-500">Contact</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Add New Product</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Fresh Tomatoes"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.length === 0 ? (
                    <option value="" disabled>No categories available. Please contact admin.</option>
                  ) : (
                    categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} {cat.name_hindi ? `(${cat.name_hindi})` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  required
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="pieces">Pieces</option>
                  <option value="dozen">Dozen</option>
                  <option value="quintal">Quintal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                <input 
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0"
                  value={form.stock_quantity}
                  onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
                placeholder="Describe your product..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* My Products */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">My Products</h2>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {products.length} products
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.length > 0 ? (
            products.map(p => (
              <div key={p.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-gray-900">{p.name}</h3>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>₹{p.price} / {p.unit}</span>
                  </div>
                  <div>Stock: {p.stock_quantity} {p.unit}</div>
                  <div>Category: {p.category_name}</div>
                  {p.description && (
                    <div className="text-xs text-gray-500 truncate">{p.description}</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p>No products yet</p>
              <p className="text-sm">Start by adding your first product</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Orders */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {orders.length} orders
          </span>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p>No orders yet</p>
            <p className="text-sm">Orders will appear here when customers place them</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Order #{o.order_number}</div>
                  <div className="text-sm text-gray-600">{o.product_name} • Qty {o.quantity}</div>
                  <div className="text-xs text-gray-500">Customer: {o.buyer_name}</div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  o.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  o.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  o.status === 'placed' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Settings Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
          <SettingsIcon className="w-5 h-5 text-gray-600" />
        </div>
        <Settings userRole="farmer" />
      </section>
    </div>
  );
}


