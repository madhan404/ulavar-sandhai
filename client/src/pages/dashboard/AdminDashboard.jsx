import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, ShoppingCart, Package, Plus, Edit, Trash2, RefreshCw, AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import Settings from '../../components/Settings';
const apiUrl = import.meta.env.VITE_URL_API || 'http://localhost:3000';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [pendingFarmers, setPendingFarmers] = useState([]);
  const [allFarmers, setAllFarmers] = useState([]);
  const [allBuyers, setAllBuyers] = useState([]);
  const [allLogistics, setAllLogistics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    name_hindi: '',
    description: ''
  });
  const [categorySearch, setCategorySearch] = useState('');
  const [stats, setStats] = useState({
    farmers: 0,
    buyers: 0,
    logistics: 0,
    pendingFarmers: 0,
    activeOrders: 0,
    totalRevenue: 0,
    monthlyGrowth: []
  });

  // Modal states for editing
  const [showFarmerEditModal, setShowFarmerEditModal] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showLogisticsEditModal, setShowLogisticsEditModal] = useState(false);
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [showImageManageModal, setShowImageManageModal] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedLogistics, setSelectedLogistics] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductForImages, setSelectedProductForImages] = useState(null);
  const [kycForm, setKYCForm] = useState({
    status: 'pending',
    reason: ''
  });

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch {
      return 'Invalid Date';
    }
  };

  // Category management functions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name) {
      toast.error('Please enter a category name');
      return;
    }

    setAddingCategory(true);
    try {
      const { data } = await axios.post(`${apiUrl}/api/admin/categories`, newCategory);
      // Create the category object with the correct structure
      const newCategoryObj = {
        id: data.category.id,
        name: data.category.name,
        name_hindi: data.category.name_hindi,
        description: data.category.description,
        created_at: new Date().toISOString()
      };
      setCategories([...categories, newCategoryObj]);
      setNewCategory({ name: '', name_hindi: '', description: '' });
      toast.success('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category. Please try again.');
    } finally {
      setAddingCategory(false);
    }
  };

  // Product management functions
  const handleAddImage = async (productId) => {
    const imageUrl = prompt('Enter image URL:');
    if (!imageUrl) return;
    
    try {
      // Find the current product
      const currentProduct = products.find(p => p.id === productId);
      if (!currentProduct) return;
      
      // Add the new image to the existing images array
      const updatedImages = [...(currentProduct.images || []), imageUrl];
      
      // Update the product in the database
      await axios.patch(`${apiUrl}/api/admin/products/${productId}/images`, {
        images: updatedImages
      });
      
      // Update the local state
      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, images: updatedImages }
          : p
      ));
      
      toast.success('Image added successfully!');
    } catch (error) {
      console.error('Error adding image:', error);
      toast.error('Failed to add image. Please try again.');
    }
  };

  const handleRemoveImage = async (productId, imageIndex) => {
    try {
      // Find the current product
      const currentProduct = products.find(p => p.id === productId);
      if (!currentProduct) return;
      
      // Remove the image at the specified index
      const updatedImages = currentProduct.images.filter((_, index) => index !== imageIndex);
      
      // Update the product in the database
      await axios.patch(`${apiUrl}/api/admin/products/${productId}/images`, {
        images: updatedImages
      });
      
      // Update the local state
      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, images: updatedImages }
          : p
      ));
      
      toast.success('Image removed successfully!');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image. Please try again.');
    }
  };

  const handleViewImages = (product) => {
    setSelectedProductForImages(product);
    setShowImageManageModal(true);
  };

  const handleEditProduct = (product) => {
    openProductEditModal(product);
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${apiUrl}/api/admin/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      toast.success('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || 'Cannot delete product';
        if (errorMessage.includes('active orders')) {
          toast.error('Cannot delete product: It has active orders. Please cancel or complete all orders first.');
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error('Failed to delete product. Please try again.');
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${apiUrl}/api/admin/categories/${categoryId}`);
      setCategories(categories.filter(cat => cat.id !== categoryId));
      toast.success('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      'active': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'rejected': 'bg-red-100 text-red-800',
      'approved': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status || 'N/A'}
      </span>
    );
  };

  // Fetch all data with better error handling and rate limit handling
  const fetchData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('Fetching admin dashboard data...');

      // Use Promise.allSettled to handle failures gracefully and continue loading other data
      const results = await Promise.allSettled([
        axios.get(`${apiUrl}/api/admin/farmers/pending`),
        axios.get(`${apiUrl}/api/admin/users/farmer`),
        axios.get(`${apiUrl}/api/admin/users/buyer`),
        axios.get(`${apiUrl}/api/admin/users/logistics`),
        axios.get(`${apiUrl}/api/admin/categories`),
        axios.get(`${apiUrl}/api/admin/products`),
        axios.get(`${apiUrl}/api/admin/stats`)
      ]); 
      // Process results and handle rate limiting
      const [
        pendingResult, farmersResult, buyersResult, 
        logisticsResult, categoriesResult, productsResult, statsResult
      ] = results;

      // Handle each result individually
      if (pendingResult.status === 'fulfilled') {
        setPendingFarmers(pendingResult.value.data);
        console.log('Pending farmers loaded:', pendingResult.value.data);
      } else {
        console.error('Failed to load pending farmers:', pendingResult.reason);
        if (pendingResult.reason.response?.status === 429) {
          setError('Rate limit exceeded. Please wait a moment and refresh.');
          return;
        }
      }

      if (farmersResult.status === 'fulfilled') {
        setAllFarmers(farmersResult.value.data);
        console.log('All farmers loaded:', farmersResult.value.data);
      }

      if (buyersResult.status === 'fulfilled') {
        setAllBuyers(buyersResult.value.data);
        console.log('All buyers loaded:', buyersResult.value.data);
      }

      if (logisticsResult.status === 'fulfilled') {
        setAllLogistics(logisticsResult.value.data);
        console.log('All logistics loaded:', logisticsResult.value.data);
      }

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value.data);
        console.log('Categories loaded:', categoriesResult.value.data);
      }

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value.data);
        console.log('Products loaded:', productsResult.value.data);
      }

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.data);
        console.log('Stats loaded:', statsResult.value.data);
      }

      // Check if we have any successful data loads
      const successfulLoads = results.filter(r => r.status === 'fulfilled').length;
      if (successfulLoads === 0) {
        setError('Failed to load any data. Please check your connection and try again.');
      } else if (successfulLoads < results.length) {
        console.warn(`Loaded ${successfulLoads}/${results.length} data sources successfully`);
      }

      console.log('Data fetching completed!');

    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 429) {
        setError('Rate limit exceeded. Please wait a moment and refresh.');
      } else {
        setError(`Failed to load data: ${error.response?.data?.details || error.message}`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchData();
    } else {
      setLoading(false);
      setError('Authentication required. Please log in as an admin.');
    }
  }, [isAuthenticated, user]);

  // Action handlers
  const approveFarmer = async (userId) => {
    try {
      await axios.patch(`${apiUrl}/api/admin/farmers/${userId}/approve`);
      alert('Farmer approved successfully!');
      await fetchData(true); // Refresh data
    } catch (error) {
      console.error('Error approving farmer:', error);
      alert('Failed to approve farmer: ' + (error.response?.data?.error || error.message));
    }
  };

  const rejectFarmer = async (userId, reason) => {
    if (!reason || reason.trim() === '') {
      alert('Please provide a rejection reason');
      return;
    }
    
    try {
      await axios.patch(`${apiUrl}/api/admin/farmers/${userId}/reject`, { reason });
      alert('Farmer rejected successfully!');
      await fetchData(true); // Refresh data
    } catch (error) {
      console.error('Error rejecting farmer:', error);
      alert('Failed to reject farmer: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  // Modal functions
  const openFarmerEditModal = (farmer) => {
    setSelectedFarmer(farmer);
    setShowFarmerEditModal(true);
  };

  const openKYCModal = (farmer) => {
    setSelectedFarmer(farmer);
    setKYCForm({ status: farmer.kyc_status || 'pending', reason: farmer.rejection_reason || '' });
    setShowKYCModal(true);
  };

  const openLogisticsEditModal = (logistics) => {
    setSelectedLogistics(logistics);
    setShowLogisticsEditModal(true);
  };

  const updateKYCStatus = async () => {
    if (!selectedFarmer) return;
    
    try {
      await axios.patch(`${apiUrl}/api/admin/farmers/${selectedFarmer.user_id}/kyc`, {
        status: kycForm.status,
        reason: kycForm.status === 'rejected' ? kycForm.reason : null
      });
      
      toast.success('KYC status updated successfully!');
      setShowKYCModal(false);
      setSelectedFarmer(null);
      await fetchData(true); // Refresh data
    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast.error('Failed to update KYC status');
    }
  };

  const updateFarmerProfile = async (farmerData) => {
    if (!selectedFarmer) return;
    
    try {
      await axios.patch(`${apiUrl}/api/admin/farmers/${selectedFarmer.user_id}/profile`, farmerData);
      
      toast.success('Farmer profile updated successfully!');
      setShowFarmerEditModal(false);
      setSelectedFarmer(null);
      await fetchData(true); // Refresh data
    } catch (error) {
      console.error('Error updating farmer profile:', error);
      toast.error('Failed to update farmer profile');
    }
  };

  const updateLogisticsProfile = async (logisticsData) => {
    if (!selectedLogistics) return;
    
    try {
      await axios.patch(`${apiUrl}/api/admin/logistics/${selectedLogistics.user_id}/profile`, logisticsData);
      
      toast.success('Logistics profile updated successfully!');
      setShowLogisticsEditModal(false);
      setSelectedLogistics(null);
      await fetchData(true); // Refresh data
    } catch (error) {
      console.error('Error updating logistics profile:', error);
      toast.error('Failed to update logistics profile');
    }
  };

  // Product edit functions
  const openProductEditModal = (product) => {
    setSelectedProduct(product);
    setShowProductEditModal(true);
  };

  const updateProduct = async (productData) => {
    if (!selectedProduct) return;
    
    try {
      await axios.patch(`${apiUrl}/api/admin/products/${selectedProduct.id}`, productData);
      
      toast.success('Product updated successfully!');
      setShowProductEditModal(false);
      setSelectedProduct(null);
      await fetchData(true); // Refresh data
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 text-6xl mb-4">🔒</div>
          <div className="text-red-600 text-xl mb-4">Access Denied</div>
          <p className="text-gray-600 mb-6">You must be logged in as an admin to access this dashboard.</p>
          <button 
            onClick={() => window.location.href = '/staff-login'}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <div className="text-red-600 text-xl mb-4">Error Loading Dashboard</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={handleRefresh}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center mx-auto space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Try Again</span>
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage farmers, buyers, and platform operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.farmers + stats.buyers + stats.logistics}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Active Orders</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeOrders}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold text-blue-600">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: UserCheck, count: pendingFarmers.length },
              { id: 'farmers', name: 'Farmers', icon: UserCheck, count: allFarmers.length },
              { id: 'buyers', name: 'Buyers', icon: UserCheck, count: allBuyers.length },
              { id: 'logistics', name: 'Logistics', icon: Package, count: allLogistics.length },
              { id: 'products', name: 'Products', icon: ShoppingCart, count: products.length },
              { id: 'categories', name: 'Categories', icon: Plus, count: categories.length },
              { id: 'settings', name: 'Settings', icon: SettingsIcon, count: 0 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Farmer Approvals</h3>
                {pendingFarmers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-green-500 text-4xl mb-2">✅</div>
                    <p className="text-gray-500">No pending farmer approvals</p>
                    <p className="text-sm text-gray-400">All farmer applications have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingFarmers.map((farmer) => (
                      <div key={farmer.user_id} className="border rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{farmer.name}</h4>
                          <p className="text-sm text-gray-600">{farmer.email} • {farmer.phone}</p>
                          <p className="text-sm text-gray-500">{farmer.city}, {farmer.state}</p>
                          <p className="text-xs text-gray-400">Registered: {formatDate(farmer.created_at)}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveFarmer(farmer.user_id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter rejection reason:');
                              if (reason) rejectFarmer(farmer.user_id, reason);
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Platform Overview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Farmers:</span>
                      <span className="font-medium">{stats.farmers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Buyers:</span>
                      <span className="font-medium">{stats.buyers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Products:</span>
                      <span className="font-medium">{products.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Farmers Tab */}
          {activeTab === 'farmers' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Farmers ({allFarmers.length})</h3>
              </div>
              <div className="overflow-x-auto">
                {allFarmers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">👨‍🌾</div>
                    <p className="text-gray-500">No farmers found</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allFarmers.map((farmer) => (
                        <tr key={farmer.user_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 font-medium">{farmer.name.charAt(0)}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{farmer.name}</div>
                                <div className="text-sm text-gray-500">{farmer.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{farmer.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{farmer.city}, {farmer.state}</div>
                            <div className="text-sm text-gray-500">{farmer.pincode}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(farmer.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(farmer.kyc_status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => openFarmerEditModal(farmer)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit Farmer"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => openKYCModal(farmer)}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  farmer.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  farmer.kyc_status === 'approved' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }`}
                                title="Update KYC Status"
                              >
                                KYC
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Buyers Tab */}
          {activeTab === 'buyers' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Buyers ({allBuyers.length})</h3>
              </div>
              <div className="overflow-x-auto">
                {allBuyers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">🛒</div>
                    <p className="text-gray-500">No buyers found</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allBuyers.map((buyer) => (
                        <tr key={buyer.user_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-medium">{buyer.name.charAt(0)}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{buyer.name}</div>
                                <div className="text-sm text-gray-500">{buyer.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{buyer.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{buyer.city}, {buyer.state}</div>
                            <div className="text-sm text-gray-500">{buyer.pincode}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(buyer.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(buyer.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Logistics Tab */}
          {activeTab === 'logistics' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Logistics Partners ({allLogistics.length})</h3>
              </div>
              <div className="overflow-x-auto">
                {allLogistics.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">🚚</div>
                    <p className="text-gray-500">No logistics partners found</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allLogistics.map((logistics) => (
                        <tr key={logistics.user_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-purple-600 font-medium">{logistics.name.charAt(0)}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{logistics.name}</div>
                                <div className="text-sm text-gray-500">{logistics.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{logistics.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(logistics.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(logistics.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => openLogisticsEditModal(logistics)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Logistics Partner"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Products ({products.length})</h3>
              </div>
              <div className="overflow-x-auto">
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📦</div>
                    <p className="text-gray-500">No products found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                    {products.map((product) => (
                      <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        {/* Product Images */}
                        <div className="relative h-48 bg-gray-100">
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
                                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                  +{product.images.length - 1} more
                                </div>
                              )}
                              {/* Image Management Buttons */}
                              <div className="absolute top-2 left-2 flex space-x-1">
                                <button
                                  onClick={() => handleAddImage(product.id)}
                                  className="bg-blue-600 text-white p-1 rounded-full hover:bg-blue-700 transition-colors"
                                  title="Add Image"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                                {product.images.length > 0 && (
                                  <>
                                    <button
                                      onClick={() => handleViewImages(product)}
                                      className="bg-green-600 text-white p-1 rounded-full hover:bg-green-700 transition-colors"
                                      title="View All Images"
                                    >
                                      <Package className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (product.images.length > 1) {
                                          if (confirm(`Remove image ${product.images.length > 1 ? '1' : ''} from "${product.name}"?`)) {
                                            handleRemoveImage(product.id, 0);
                                          }
                                        } else {
                                          if (confirm('Remove the only image for this product?')) {
                                            handleRemoveImage(product.id, 0);
                                          }
                                        }
                                      }}
                                      className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                                      title="Remove Image"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No images</p>
                                <button
                                  onClick={() => handleAddImage(product.id)}
                                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                                >
                                  Add Image
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-lg">{product.name}</h4>
                            <span className="text-sm text-gray-500">#{product.id}</span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 overflow-hidden text-ellipsis display-webkit-box -webkit-line-clamp-2 -webkit-box-orient-vertical">
                            {product.description || 'No description available'}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                            <div>
                              <span className="text-gray-500">Category:</span>
                              <span className="ml-1 font-medium">{product.category_name}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Farmer:</span>
                              <span className="ml-1 font-medium">{product.farmer_name}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Price:</span>
                              <span className="ml-1 font-medium text-green-600">₹{product.price}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Unit:</span>
                              <span className="ml-1 font-medium">{product.unit}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Stock:</span>
                              <span className="ml-1 font-medium">{product.stock_quantity}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Status:</span>
                              <span className="ml-1">{getStatusBadge(product.status)}</span>
                            </div>
                          </div>
                          
                                                     <div className="flex items-center justify-between pt-2 border-t">
                             <div className="text-xs text-gray-400">
                               Created: {formatDate(product.created_at)}
                             </div>
                             <div className="flex items-center space-x-2">
                               {/* Active Orders Warning */}
                               {product.active_orders_count > 0 && (
                                 <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                   {product.active_orders_count} Active Order{product.active_orders_count > 1 ? 's' : ''}
                                 </div>
                               )}
                               <button
                                 onClick={() => handleEditProduct(product)}
                                 className="text-blue-600 hover:text-blue-800 p-1"
                                 title="Edit Product"
                               >
                                 <Edit className="h-4 w-4" />
                               </button>
                               <button
                                 onClick={() => handleDeleteProduct(product.id)}
                                 className={`p-1 ${
                                   product.active_orders_count > 0 
                                     ? 'text-gray-400 cursor-not-allowed' 
                                     : 'text-red-600 hover:text-red-800'
                                 }`}
                                 title={
                                   product.active_orders_count > 0 
                                     ? `Cannot delete: ${product.active_orders_count} active order${product.active_orders_count > 1 ? 's' : ''}`
                                     : 'Delete Product'
                                 }
                                 disabled={product.active_orders_count > 0}
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                             </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Add Category Form */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Add New Category</h3>
                </div>
                <div className="p-6">
                  <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category Name (English) *</label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Vegetables"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category Name (Hindi)</label>
                      <input
                        type="text"
                        value={newCategory.name_hindi}
                        onChange={(e) => setNewCategory({ ...newCategory, name_hindi: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., सब्जियां"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        placeholder="Describe this category..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        disabled={addingCategory}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {addingCategory ? 'Adding...' : 'Add Category'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Categories List */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">All Categories ({categories.length})</h3>
                    <div className="flex items-center space-x-4">
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  {(() => {
                    const filteredCategories = categories.filter(cat =>
                      cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                      (cat.name_hindi && cat.name_hindi.includes(categorySearch)) ||
                      (cat.description && cat.description.toLowerCase().includes(categorySearch.toLowerCase()))
                    );
                    
                    if (filteredCategories.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <div className="text-gray-400 text-4xl mb-2">🔍</div>
                          <p className="text-gray-500">
                            {categories.length === 0 ? 'No categories found' : 'No categories match your search'}
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hindi Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCategories.map((category) => (
                          <tr key={category.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{category.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{category.name_hindi || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500">{category.description || 'No description'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(category.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Category"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <Settings userRole="admin" />
          )}
        </div>
      </div>

      {/* Modals */}
      
      {/* KYC Status Modal */}
      {showKYCModal && selectedFarmer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Update KYC Status</h3>
              <button 
                onClick={() => setShowKYCModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farmer</label>
                <p className="text-gray-900">{selectedFarmer.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KYC Status</label>
                <select
                  value={kycForm.status}
                  onChange={(e) => setKYCForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              {kycForm.status === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason</label>
                  <textarea
                    value={kycForm.reason}
                    onChange={(e) => setKYCForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter rejection reason..."
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowKYCModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={updateKYCStatus}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update KYC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Farmer Edit Modal */}
      {showFarmerEditModal && selectedFarmer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Farmer Profile</h3>
              <button 
                onClick={() => setShowFarmerEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue={selectedFarmer.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={selectedFarmer.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    defaultValue={selectedFarmer.phone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    defaultValue={selectedFarmer.status}
                    onChange={(e) => setSelectedFarmer(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    defaultValue={selectedFarmer.city || ''}
                    onChange={(e) => setSelectedFarmer(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    defaultValue={selectedFarmer.state || ''}
                    onChange={(e) => setSelectedFarmer(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    defaultValue={selectedFarmer.pincode || ''}
                    onChange={(e) => setSelectedFarmer(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFarmerEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateFarmerProfile(selectedFarmer)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logistics Edit Modal */}
      {showLogisticsEditModal && selectedLogistics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Logistics Partner</h3>
              <button 
                onClick={() => setShowLogisticsEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue={selectedLogistics.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={selectedLogistics.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    defaultValue={selectedLogistics.phone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    defaultValue={selectedLogistics.status}
                    onChange={(e) => setSelectedLogistics(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogisticsEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateLogisticsProfile(selectedLogistics)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Edit Modal */}
      {showProductEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Product: {selectedProduct.name}</h3>
              <button 
                onClick={() => setShowProductEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    defaultValue={selectedProduct.name}
                    onChange={(e) => setSelectedProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={selectedProduct.price}
                    onChange={(e) => setSelectedProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    defaultValue={selectedProduct.stock_quantity}
                    onChange={(e) => setSelectedProduct(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    defaultValue={selectedProduct.unit}
                    onChange={(e) => setSelectedProduct(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., kg, pieces, dozen"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    defaultValue={selectedProduct.status}
                    onChange={(e) => setSelectedProduct(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    defaultValue={selectedProduct.category_id}
                    onChange={(e) => setSelectedProduct(prev => ({ ...prev, category_id: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  defaultValue={selectedProduct.description}
                  onChange={(e) => setSelectedProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Describe the product..."
                />
              </div>

              {/* Image Management Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <div className="space-y-2">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    selectedProduct.images.map((image, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                        <img 
                          src={image} 
                          alt={`Image ${index + 1}`} 
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTUwTDIwMCAxNzVMMjI1IDE1MEgyMTJWMTAwSDE4OFYxNTBIMTc1WiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjIxMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjc3NDhDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBVbmF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
                          }}
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={image}
                            onChange={(e) => {
                              const newImages = [...selectedProduct.images];
                              newImages[index] = e.target.value;
                              setSelectedProduct(prev => ({ ...prev, images: newImages }));
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="Image URL"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newImages = selectedProduct.images.filter((_, i) => i !== index);
                            setSelectedProduct(prev => ({ ...prev, images: newImages }));
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove Image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No images</p>
                  )}
                  
                  {/* Add New Image */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Add new image URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          const newImages = [...(selectedProduct.images || []), e.target.value.trim()];
                          setSelectedProduct(prev => ({ ...prev, images: newImages }));
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="Add new image URL"]');
                        if (input && input.value.trim()) {
                          const newImages = [...(selectedProduct.images || []), input.value.trim()];
                          setSelectedProduct(prev => ({ ...prev, images: newImages }));
                          input.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProductEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateProduct(selectedProduct)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Management Modal */}
      {showImageManageModal && selectedProductForImages && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Manage Images: {selectedProductForImages.name}</h3>
              <button 
                onClick={() => setShowImageManageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Current Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Images</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedProductForImages.images && selectedProductForImages.images.length > 0 ? (
                    selectedProductForImages.images.map((image, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <img 
                          src={image} 
                          alt={`Image ${index + 1}`} 
                          className="w-full h-32 object-cover rounded mb-2"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTUwTDIwMCAxNzVMMjI1IDE1MEgyMTJWMTAwSDE4OFYxNTBIMTc1WiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSIyMDAiIHk9IjIxMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjc3NDhDIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBVbmF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+';
                          }}
                        />
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={image}
                            onChange={(e) => {
                              const newImages = [...selectedProductForImages.images];
                              newImages[index] = e.target.value;
                              setSelectedProductForImages(prev => ({ ...prev, images: newImages }));
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            placeholder="Image URL"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                const newImages = selectedProductForImages.images.filter((_, i) => i !== index);
                                setSelectedProductForImages(prev => ({ ...prev, images: newImages }));
                              }}
                              className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              Remove
                            </button>
                            <button
                              onClick={() => {
                                if (index > 0) {
                                  const newImages = [...selectedProductForImages.images];
                                  [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
                                  setSelectedProductForImages(prev => ({ ...prev, images: newImages }));
                                }
                              }}
                              disabled={index === 0}
                              className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:opacity-50"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => {
                                if (index < selectedProductForImages.images.length - 1) {
                                  const newImages = [...selectedProductForImages.images];
                                  [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
                                  setSelectedProductForImages(prev => ({ ...prev, images: newImages }));
                                }
                              }}
                              disabled={index === selectedProductForImages.images.length - 1}
                              className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 disabled:opacity-50"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm col-span-full">No images</p>
                  )}
                </div>
              </div>
              
              {/* Add New Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add New Image</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Enter image URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        const newImages = [...(selectedProductForImages.images || []), e.target.value.trim()];
                        setSelectedProductForImages(prev => ({ ...prev, images: newImages }));
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Enter image URL"]');
                      if (input && input.value.trim()) {
                        const newImages = [...(selectedProductForImages.images || []), input.value.trim()];
                        setSelectedProductForImages(prev => ({ ...prev, images: newImages }));
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowImageManageModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.patch(`${apiUrl}/api/admin/products/${selectedProductForImages.id}/images`, {
                      images: selectedProductForImages.images
                    });
                    
                    // Update local state
                    setProducts(products.map(p => 
                      p.id === selectedProductForImages.id 
                        ? { ...p, images: selectedProductForImages.images }
                        : p
                    ));
                    
                    toast.success('Images updated successfully!');
                    setShowImageManageModal(false);
                    setSelectedProductForImages(null);
                  } catch (error) {
                    console.error('Error updating images:', error);
                    toast.error('Failed to update images');
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


