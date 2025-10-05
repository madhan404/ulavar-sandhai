import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Package, Truck, Clock, CheckCircle, MapPin, Settings as SettingsIcon } from 'lucide-react';
import Settings from '../../components/Settings';
const apiUrl = import.meta.env.VITE_URL_API || 'http://localhost:3000';
export default function LogisticsDashboard() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingForm, setTrackingForm] = useState({
    courier_name: '',
    tracking_number: '',
    estimated_delivery: '',
    pod_upload_url: ''
  });

  // Static logistics data
  const staticOrders = [
    {
      id: 1,
      order_number: 'ORD20241201001',
      total_amount: 1250,
      buyer_name: 'Amit Patel',
      farmer_name: 'Rajesh Kumar',
      status: 'picked',
      product_name: 'Fresh Tomatoes'
    },
    {
      id: 2,
      order_number: 'ORD20241201002',
      total_amount: 890,
      buyer_name: 'Priya Singh',
      farmer_name: 'Lakshmi Devi',
      status: 'in_transit',
      product_name: 'Organic Potatoes'
    },
    {
      id: 3,
      order_number: 'ORD20241201003',
      total_amount: 2100,
      buyer_name: 'Rahul Sharma',
      farmer_name: 'Gurpreet Singh',
      status: 'out_for_delivery',
      product_name: 'Fresh Onions'
    }
  ];

  useEffect(() => {
    const run = async () => {
      try {
        const { data } = await axios.get(`${apiUrl}/api/logistics/orders`);
        console.log('Logistics orders:', data);
        setOrders(data);
      } catch (e) {
        console.error('Error fetching logistics orders:', e);
        // Use static data if API fails
        setOrders(staticOrders);
      }
    };
    run();
  }, []);

  const update = async (id, status) => {
    try {
      await axios.patch(`${apiUrl}/api/logistics/orders/${id}/tracking`, { status });
      setOrders(prev => prev.map(order => 
        order.id === id ? { ...order, status } : order
      ));
    } catch (e) {
      // Handle error
    }
  };

  const updateTrackingInfo = async (orderId) => {
    try {
      await axios.patch(`${apiUrl}/api/logistics/orders/${orderId}/tracking`, trackingForm);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, ...trackingForm } : order
      ));
      setShowTrackingModal(false);
      setTrackingForm({
        courier_name: '',
        tracking_number: '',
        estimated_delivery: '',
        pod_upload_url: ''
      });
    } catch (e) {
      console.error('Error updating tracking info:', e);
    }
  };

  const openTrackingModal = (order) => {
    setSelectedOrder(order);
    setTrackingForm({
      courier_name: order.courier_name || '',
      tracking_number: order.tracking_number || '',
      estimated_delivery: order.estimated_delivery || '',
      pod_upload_url: order.pod_upload_url || ''
    });
    setShowTrackingModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'picked': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'picked': return <Package className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'out_for_delivery': return <Clock className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Logistics Dashboard</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Truck className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Transit</p>
              <p className="text-2xl font-semibold text-gray-900">
                {orders.filter(o => o.status === 'in_transit').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Out for Delivery</p>
              <p className="text-2xl font-semibold text-gray-900">
                {orders.filter(o => o.status === 'out_for_delivery').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-semibold text-gray-900">
                {orders.filter(o => o.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Active Orders</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {orders.map(o => (
            <div key={o.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">Order #{o.order_number}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(o.status)}`}>
                      {getStatusIcon(o.status)}
                      <span className="ml-1 capitalize">{o.status.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Product: {o.product_name}</div>
                    <div>Buyer: {o.buyer_name} • Farmer: {o.farmer_name}</div>
                    <div className="font-medium text-gray-900">₹{o.total_amount}</div>
                    
                    {/* Address Information */}
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pickup Address */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Package className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-800 text-sm">Pickup Address</span>
                        </div>
                        <div className="text-xs text-blue-700 space-y-1">
                          <div className="font-medium">{o.farmer_name}</div>
                          {o.pickup_address && <div>{o.pickup_address}</div>}
                          <div>{o.pickup_city}, {o.pickup_state} - {o.pickup_pincode}</div>
                        </div>
                      </div>
                      
                      {/* Delivery Address */}
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <MapPin className="w-4 h-4 text-green-600 mr-2" />
                          <span className="font-medium text-green-800 text-sm">Delivery Address</span>
                        </div>
                        <div className="text-xs text-green-700 space-y-1">
                          <div className="font-medium">{o.buyer_name}</div>
                          {o.delivery_address && <div>{o.delivery_address}</div>}
                          <div>{o.delivery_city}, {o.delivery_state} - {o.delivery_pincode}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 ml-6">
                  {/* Status Update Buttons */}
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => update(o.id, 'picked')}
                      disabled={o.status === 'picked'}
                    >
                      Picked
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => update(o.id, 'in_transit')}
                      disabled={o.status === 'in_transit'}
                    >
                      In Transit
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => update(o.id, 'out_for_delivery')}
                      disabled={o.status === 'out_for_delivery'}
                    >
                      Out for Delivery
                    </button>
                    <button 
                      className="btn btn-success btn-sm" 
                      onClick={() => update(o.id, 'delivered')}
                      disabled={o.status === 'delivered'}
                    >
                      Delivered
                    </button>
                  </div>
                  
                  {/* Logistics Info Display */}
                  <div className="text-xs text-gray-500 space-y-1">
                    {o.tracking_number && (
                      <div>📦 Tracking: {o.tracking_number}</div>
                    )}
                    {o.courier_name && (
                      <div>🚚 Courier: {o.courier_name}</div>
                    )}
                    {o.estimated_delivery && (
                      <div>📅 ETA: {new Date(o.estimated_delivery).toLocaleDateString()}</div>
                    )}
                  </div>
                  
                  {/* Tracking Info Button */}
                  <button 
                    className="btn btn-outline btn-sm text-xs"
                    onClick={() => openTrackingModal(o)}
                  >
                    📝 Update Tracking
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Update Tracking Info</h3>
              <button 
                onClick={() => setShowTrackingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Courier Name
                </label>
                <input
                  type="text"
                  value={trackingForm.courier_name}
                  onChange={(e) => setTrackingForm(prev => ({ ...prev, courier_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter courier name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingForm.tracking_number}
                  onChange={(e) => setTrackingForm(prev => ({ ...prev, tracking_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter tracking number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Delivery
                </label>
                <input
                  type="date"
                  value={trackingForm.estimated_delivery}
                  onChange={(e) => setTrackingForm(prev => ({ ...prev, estimated_delivery: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  POD Upload URL (Optional)
                </label>
                <input
                  type="url"
                  value={trackingForm.pod_upload_url}
                  onChange={(e) => setTrackingForm(prev => ({ ...prev, pod_upload_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter proof of delivery URL"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTrackingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => updateTrackingInfo(selectedOrder.id)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Section */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
          <SettingsIcon className="w-5 h-5 text-gray-600" />
        </div>
        <Settings userRole="logistics" />
      </div>
    </div>
  );
}


