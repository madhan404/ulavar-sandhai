import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ShoppingCart, Truck, Building2, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_URL_API || 'http://localhost:3000';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'buyer'
  });

  const [farmerData, setFarmerData] = useState({
    city: '',
    state: '',
    pincode: '',
    pickup_address: '',
    pan_number: '',
    gst_number: '',
    aadhaar_number: '',
    bank_name: '',
    bank_account_number: '',
    bank_ifsc_code: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle location state for pre-filling role
  useEffect(() => {
    if (location.state?.prefillRole) {
      setFormData(prev => ({ ...prev, role: location.state.prefillRole }));
    }
    if (location.state?.message) {
      setError(location.state.message);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFarmerInputChange = (e) => {
    const { name, value } = e.target;
    setFarmerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        ...formData,
        ...(formData.role === 'farmer' && farmerData)
      };

      const response = await axios.post(`${apiUrl}/api/auth/register`, registrationData);
      
      if (response.data.success) {
        if (formData.role === 'farmer') {
          alert('Registration successful! Your application is pending admin approval. You will be notified once approved.');
          navigate('/farmer-login');
        } else {
          alert('Registration successful! You can now login.');
          navigate('/buyer-login');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      id: 'buyer',
      title: 'Buyer',
      description: 'Purchase agricultural products',
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      id: 'farmer',
      title: 'Farmer',
      description: 'Sell your agricultural products',
      icon: User,
      color: 'green'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join our agricultural marketplace</p>
        </div>

        {/* Role Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Role</h2>
          <div className="space-y-3">
            {roleOptions.map((role) => {
              const Icon = role.icon;
              const isSelected = formData.role === role.id;
              const colorClasses = {
                blue: 'border-blue-200 bg-blue-50',
                green: 'border-green-200 bg-green-50'
              };
              
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: role.id }))}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    isSelected 
                      ? `${colorClasses[role.color]} border-${role.color}-500` 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? `bg-${role.color}-100` : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        isSelected ? `text-${role.color}-600` : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
                        isSelected ? `text-${role.color}-900` : 'text-gray-900'
                      }`}>
                        {role.title}
                      </h3>
                      <p className={`text-sm ${
                        isSelected ? `text-${role.color}-700` : 'text-gray-600'
                      }`}>
                        {role.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter 10-digit phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Farmer-specific Information */}
            {formData.role === 'farmer' && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Farmer Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={farmerData.city}
                      onChange={handleFarmerInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={farmerData.state}
                      onChange={handleFarmerInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={farmerData.pincode}
                      onChange={handleFarmerInputChange}
                      required
                      pattern="[0-9]{6}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter 6-digit pincode"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      name="pan_number"
                      value={farmerData.pan_number}
                      onChange={handleFarmerInputChange}
                      pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="ABCDE1234F"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      name="gst_number"
                      value={farmerData.gst_number}
                      onChange={handleFarmerInputChange}
                      pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[Z]{1}[A-Z0-9]{1}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="27ABCDE1234F1Z5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhaar Number
                    </label>
                    <input
                      type="text"
                      name="aadhaar_number"
                      value={farmerData.aadhaar_number}
                      onChange={handleFarmerInputChange}
                      pattern="[0-9]{12}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter 12-digit Aadhaar"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Address *
                  </label>
                  <textarea
                    name="pickup_address"
                    value={farmerData.pickup_address}
                    onChange={handleFarmerInputChange}
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your farm/pickup address"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Bank Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bank_name"
                        value={farmerData.bank_name}
                        onChange={handleFarmerInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter bank name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="bank_account_number"
                        value={farmerData.bank_account_number}
                        onChange={handleFarmerInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter account number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        name="bank_ifsc_code"
                        value={farmerData.bank_ifsc_code}
                        onChange={handleFarmerInputChange}
                        pattern="[A-Z]{4}0[A-Z0-9]{6}"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="SBIN0001234"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/buyer-login')}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;


