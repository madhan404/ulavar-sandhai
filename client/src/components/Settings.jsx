import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  CreditCard, 
  Camera,
  Save,
  X,
  Edit
} from 'lucide-react';
import { toast } from 'react-toastify';
const apiUrl = import.meta.env.VITE_URL_API;

export default function Settings({ userRole }) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Role-specific form fields
  const [farmerForm, setFarmerForm] = useState({
    aadhaar_number: '',
    pan_number: '',
    gst_number: '',
    bank_account_number: '',
    bank_ifsc_code: '',
    bank_name: '',
    pickup_address: '',
    photo_url: ''
  });

  const [logisticsForm, setLogisticsForm] = useState({
    company_name: '',
    service_area: '',
    vehicle_type: '',
    contact_person: '',
    emergency_contact: ''
  });

  const [adminForm, setAdminForm] = useState({
    department: '',
    designation: '',
    permissions: '',
    office_location: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated, userRole]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load basic user info
      const userResponse = await axios.get(`${apiUrl}/api/users/${user.id}`);
      const userData = userResponse.data;
      
      setProfileForm({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      });

      // Load role-specific data
      if (userRole === 'farmer') {
        const farmerResponse = await axios.get(`${apiUrl}/api/farmers/profile`);
        const farmerData = farmerResponse.data;
        
        setFarmerForm({
          aadhaar_number: farmerData.aadhaar_number || '',
          pan_number: farmerData.pan_number || '',
          gst_number: farmerData.gst_number || '',
          bank_account_number: farmerData.bank_account_number || '',
          bank_ifsc_code: farmerData.bank_ifsc_code || '',
          bank_name: farmerData.bank_name || '',
          pickup_address: farmerData.pickup_address || '',
          photo_url: farmerData.photo_url || ''
        });

        setProfileForm(prev => ({
          ...prev,
          address: farmerData.pickup_address || '',
          city: farmerData.city || '',
          state: farmerData.state || '',
          pincode: farmerData.pincode || ''
        }));
      }

      if (userRole === 'logistics') {
        const logisticsResponse = await axios.get(`${apiUrl}/api/logistics/profile`);
        const logisticsData = logisticsResponse.data;
        
        setLogisticsForm({
          company_name: logisticsData.company_name || '',
          service_area: logisticsData.service_area || '',
          vehicle_type: logisticsData.vehicle_type || '',
          contact_person: logisticsData.contact_person || '',
          emergency_contact: logisticsData.emergency_contact || ''
        });
      }

      if (userRole === 'admin') {
        const adminResponse = await axios.get(`${apiUrl}/api/admin/profile`);
        const adminData = adminResponse.data;
        
        setAdminForm({
          department: adminData.department || '',
          designation: adminData.designation || '',
          permissions: adminData.permissions || '',
          office_location: adminData.office_location || ''
        });
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update basic user info
      await axios.patch(`${apiUrl}/api/users/${user.id}`, {
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone
      });

      // Update role-specific info
      if (userRole === 'farmer') {
        await axios.patch(`${apiUrl}/api/farmers/profile`, {
          ...farmerForm,
          pickup_address: profileForm.address,
          city: profileForm.city,
          state: profileForm.state,
          pincode: profileForm.pincode
        });
      }

      if (userRole === 'logistics') {
        await axios.patch(`${apiUrl}/api/logistics/profile`, logisticsForm);
      }

      if (userRole === 'admin') {
        await axios.patch(`${apiUrl}/api/admin/profile`, adminForm);
      }

      toast.success('Profile updated successfully!');
      setShowEditModal(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getRoleTitle = () => {
    switch (userRole) {
      case 'farmer': return 'Farmer';
      case 'logistics': return 'Logistics';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'farmer': return '🌾';
      case 'logistics': return '🚚';
      case 'admin': return '👨‍💼';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getRoleIcon()}</span>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
            <p className="text-gray-600">Manage your {getRoleTitle().toLowerCase()} account settings</p>
          </div>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Edit className="h-4 w-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Profile Information Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Basic Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="text-gray-900">{profileForm.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900">{profileForm.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="text-gray-900">{profileForm.phone}</p>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-green-600" />
            Address Information
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="text-gray-900">{profileForm.address || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">City</label>
              <p className="text-gray-900">{profileForm.city || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <p className="text-gray-900">{profileForm.state || 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pincode</label>
              <p className="text-gray-900">{profileForm.pincode || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Role-specific Information */}
        {userRole === 'farmer' && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2 text-purple-600" />
                Business Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                  <p className="text-gray-900">{farmerForm.aadhaar_number || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                  <p className="text-gray-900">{farmerForm.pan_number || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GST Number</label>
                  <p className="text-gray-900">{farmerForm.gst_number || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-indigo-600" />
                Banking Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                  <p className="text-gray-900">{farmerForm.bank_name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Number</label>
                  <p className="text-gray-900">{farmerForm.bank_account_number || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                  <p className="text-gray-900">{farmerForm.bank_ifsc_code || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {userRole === 'logistics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-orange-600" />
              Company Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <p className="text-gray-900">{logisticsForm.company_name || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Area</label>
                <p className="text-gray-900">{logisticsForm.service_area || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                <p className="text-gray-900">{logisticsForm.vehicle_type || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                <p className="text-gray-900">{logisticsForm.contact_person || 'Not specified'}</p>
              </div>
            </div>
          </div>
        )}

        {userRole === 'admin' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-red-600" />
              Administrative Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <p className="text-gray-900">{adminForm.department || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Designation</label>
                <p className="text-gray-900">{adminForm.designation || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Office Location</label>
                <p className="text-gray-900">{adminForm.office_location || 'Not specified'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Edit Profile</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Information Form */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </div>

              {/* Address Information Form */}
              <div className="border-b border-gray-200 pb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={profileForm.address}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>
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

              {/* Role-specific Forms */}
              {userRole === 'farmer' && (
                <>
                  <div className="border-b border-gray-200 pb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Business Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                        <input
                          type="text"
                          value={farmerForm.aadhaar_number}
                          onChange={(e) => setFarmerForm(prev => ({ ...prev, aadhaar_number: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                        <input
                          type="text"
                          value={farmerForm.pan_number}
                          onChange={(e) => setFarmerForm(prev => ({ ...prev, pan_number: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                        <input
                          type="text"
                          value={farmerForm.gst_number}
                          onChange={(e) => setFarmerForm(prev => ({ ...prev, gst_number: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-gray-200 pb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Banking Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={farmerForm.bank_name}
                          onChange={(e) => setFarmerForm(prev => ({ ...prev, bank_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                        <input
                          type="text"
                          value={farmerForm.bank_account_number}
                          onChange={(e) => setFarmerForm(prev => ({ ...prev, bank_account_number: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                        <input
                          type="text"
                          value={farmerForm.bank_ifsc_code}
                          onChange={(e) => setFarmerForm(prev => ({ ...prev, bank_ifsc_code: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {userRole === 'logistics' && (
                <div className="border-b border-gray-200 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Company Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={logisticsForm.company_name}
                        onChange={(e) => setLogisticsForm(prev => ({ ...prev, company_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Service Area</label>
                      <input
                        type="text"
                        value={logisticsForm.service_area}
                        onChange={(e) => setLogisticsForm(prev => ({ ...prev, service_area: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                      <input
                        type="text"
                        value={logisticsForm.vehicle_type}
                        onChange={(e) => setLogisticsForm(prev => ({ ...prev, vehicle_type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                      <input
                        type="text"
                        value={logisticsForm.contact_person}
                        onChange={(e) => setLogisticsForm(prev => ({ ...prev, contact_person: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {userRole === 'admin' && (
                <div className="border-b border-gray-200 pb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Administrative Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <input
                        type="text"
                        value={adminForm.department}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                      <input
                        type="text"
                        value={adminForm.designation}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, designation: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Office Location</label>
                      <input
                        type="text"
                        value={adminForm.office_location}
                        onChange={(e) => setAdminForm(prev => ({ ...prev, office_location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
