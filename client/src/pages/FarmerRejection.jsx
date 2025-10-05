import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_URL_API || 'http://localhost:3000';
export default function FarmerRejection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get rejection details from location state or URL params
  const rejectionData = location.state?.rejectionData || {};
  const { rejectionReason, farmerId } = rejectionData;

  const handleTryAgain = () => {
    // Navigate to registration page
    navigate('/register', { 
      state: { 
        prefillRole: 'farmer',
        message: 'You can now re-register as a farmer. Please ensure all information is correct.'
      }
    });
  };

  const handleCancel = async () => {
    if (!farmerId) {
      navigate('/');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call admin API to delete the rejected farmer
      await axios.delete(`${apiUrl}/api/admin/farmers/${farmerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Clear any stored data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Navigate to home
      navigate('/', { 
        state: { 
          message: 'Your rejected application has been removed. You can register again anytime.' 
        }
      });
    } catch (error) {
      console.error('Error deleting farmer:', error);
      setError('Failed to remove your application. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Rejected</h1>
            <p className="text-gray-600">Your farmer application was not approved</p>
          </div>

          {/* Rejection Reason */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-2">Rejection Reason:</h3>
                <p className="text-sm text-red-700">
                  {rejectionReason || 'No specific reason provided by the administrator.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleTryAgain}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{loading ? 'Removing...' : 'Remove Application'}</span>
            </button>

            <button
              onClick={handleGoHome}
              className="w-full bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
            >
              Go to Home
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              If you believe this rejection was made in error, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
