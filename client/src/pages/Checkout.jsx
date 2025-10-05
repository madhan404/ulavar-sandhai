import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShoppingCart, 
  MapPin, 
  CreditCard, 
  Truck, 
  CheckCircle,
  ArrowLeft,
  Package,
  User,
  Phone,
  Mail,
  Plus,
  Edit,
  X
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Checkout() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState({});
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    deliveryFee: 0,
    tax: 0,
    total: 0
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'buyer') {
      navigate('/login');
      return;
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      setCart(cartData);
      calculateOrderSummary(cartData);
    }

    // Load user profile and addresses
    loadProfile();
    loadAddresses();
  }, [isAuthenticated, user, navigate]);

  const loadProfile = async () => {
    try {
      const response = await axios.get('/api/buyers/profile');
      setProfile(response.data);
      
      // Set default address if available
      if (response.data.default_address) {
        setSelectedAddress({
          id: 'default',
          address: response.data.default_address,
          city: response.data.city,
          state: response.data.state,
          pincode: response.data.pincode,
          type: 'Default'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      const response = await axios.get(`/api/buyers/addresses`);
      setAddresses(response.data);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

// added 💀

  const calculateOrderSummary = (cartItems) => {
    const subtotal = Object.values(cartItems).reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    const deliveryFee = subtotal > 500 ? 0 : 50; // Free delivery above ₹500
    const tax = subtotal * 0.05; // 5% GST
    const total = subtotal + deliveryFee + tax;

    setOrderSummary({ subtotal, deliveryFee, tax, total });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      const newCart = { ...cart };
      delete newCart[productId];
      setCart(newCart);
      localStorage.setItem('shoppingCart', JSON.stringify(newCart));
      calculateOrderSummary(newCart);
    } else {
      const newCart = {
        ...cart,
        [productId]: { ...cart[productId], quantity }
      };
      setCart(newCart);
      localStorage.setItem('shoppingCart', JSON.stringify(newCart));
      calculateOrderSummary(newCart);
    }
  };

  const removeItem = (productId) => {
    const newCart = { ...cart };
    delete newCart[productId];
    setCart(newCart);
    localStorage.setItem('shoppingCart', JSON.stringify(newCart));
    calculateOrderSummary(newCart);
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setLoading(true);
    try {
      // Convert cart to order format
      const orderItems = Object.values(cart).map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_amount: item.price * item.quantity
      }));

      // Create order
      const orderData = {
        items: orderItems,
        delivery_address: selectedAddress.address,
        delivery_city: selectedAddress.city,
        delivery_state: selectedAddress.state,
        delivery_pincode: selectedAddress.pincode,
        total_amount: orderSummary.total,
        payment_method: paymentMethod
      };

      const response = await axios.post('/api/orders', orderData);
      
      // Set order details for confirmation
      setOrderDetails({
        orderIds: response.data.orderIds,
        orderNumbers: response.data.orderNumbers,
        totalAmount: response.data.totalAmount,
        deliveryAddress: selectedAddress
      });
      
      // Clear cart
      localStorage.removeItem('shoppingCart');
      setCart({});
      
      // Show success message
      setOrderPlaced(true);
      toast.success('Order placed successfully!');
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const selectAddress = (address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  if (Object.keys(cart).length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to your cart to proceed with checkout</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Order Confirmation Screen
  if (orderPlaced && orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-8">Thank you for your order. We'll start processing it right away.</p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Numbers:</span>
                  <span className="font-medium">
                    {orderDetails.orderNumbers.join(', ')}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold text-green-600">₹{orderDetails.totalAmount.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">Cash on Delivery</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Address:</span>
                  <span className="font-medium text-right max-w-xs">
                    {orderDetails.deliveryAddress.address}, {orderDetails.deliveryAddress.city}, {orderDetails.deliveryAddress.state} - {orderDetails.deliveryAddress.pincode}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => navigate('/dashboard/buyer?tab=orders')}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                View My Orders
              </button>
              
              <button
                onClick={() => navigate('/products')}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Farmer will receive your order and confirm availability</p>
                <p>• Logistics team will pick up and deliver your order</p>
                <p>• You'll receive real-time updates on order status</p>
                <p>• Pay cash when your order is delivered</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Products
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-green-600" />
                  Delivery Address
                </h2>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  {selectedAddress ? 'Change' : 'Select Address'}
                </button>
              </div>
              
              {selectedAddress ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{selectedAddress.type}</span>
                          {selectedAddress.type === 'Default' && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{selectedAddress.address}</p>
                        <p className="text-gray-600">{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No delivery address selected</h3>
                  <p className="text-gray-600 mb-4">Please select a delivery address to continue</p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Select Address
                  </button>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-green-600" />
                Order Items
              </h2>
              
              <div className="space-y-4">
                {Object.values(cart).map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOCAzMkwzMiAzNkwzNiAzMkg0NFYyNEgyMFYzMkgyOFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">₹{item.price} per {item.unit}</p>
                      <p className="text-sm text-gray-500">Farmer: {item.farmer_name}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                Payment Method
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    disabled
                    className="text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Online Payment</p>
                    <p className="text-sm text-gray-600">Credit/Debit card, UPI, Net Banking</p>
                    <p className="text-xs text-gray-500">Coming Soon</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Order Summary
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({Object.values(cart).reduce((total, item) => total + item.quantity, 0)} items)</span>
                  <span>₹{orderSummary.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span className={orderSummary.deliveryFee === 0 ? 'text-green-600' : ''}>
                    {orderSummary.deliveryFee === 0 ? 'FREE' : `₹${orderSummary.deliveryFee}`}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>GST (5%)</span>
                  <span>₹{orderSummary.tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{orderSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {orderSummary.deliveryFee === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center text-green-800">
                    <Truck className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Free Delivery</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">Orders above ₹500 qualify for free delivery</p>
                </div>
              )}

              <button
                onClick={placeOrder}
                disabled={loading || !selectedAddress || !paymentMethod}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Delivery Address</h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Default Address */}
              {profile?.default_address && (
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedAddress?.id === 'default' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => selectAddress({
                    id: 'default',
                    address: profile.default_address,
                    city: profile.city,
                    state: profile.state,
                    pincode: profile.pincode,
                    type: 'Default'
                  })}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">Default Address</span>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Default
                          </span>
                        </div>
                        <p className="text-gray-600">{profile.default_address}</p>
                        <p className="text-gray-600">{profile.city}, {profile.state} - {profile.pincode}</p>
                      </div>
                    </div>
                    {selectedAddress?.id === 'default' && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              )}

              {/* Saved Addresses */}
              {addresses.map(address => (
                <div 
                  key={address.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedAddress?.id === address.id 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => selectAddress(address)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">{address.type}</span>
                          {address.is_default && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600">{address.address}</p>
                        <p className="text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                      </div>
                    </div>
                    {selectedAddress?.id === address.id && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                </div>
              ))}

              {/* Add New Address Button */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <button
                  onClick={() => {
                    setShowAddressModal(false);
                    navigate('/dashboard/buyer?tab=addresses');
                  }}
                  className="flex items-center justify-center space-x-2 text-green-600 hover:text-green-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Address</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

