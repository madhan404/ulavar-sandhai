import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login.jsx';
import BuyerLogin from './pages/BuyerLogin';
import FarmerLogin from './pages/FarmerLogin';
import StaffLogin from './pages/StaffLogin';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import FarmerRejection from './pages/FarmerRejection';

// Dashboard pages
import FarmerDashboard from './pages/dashboard/FarmerDashboard';
import BuyerDashboard from './pages/dashboard/BuyerDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import LogisticsDashboard from './pages/dashboard/LogisticsDashboard';

import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/buyer-login" element={<BuyerLogin />} />
              <Route path="/farmer-login" element={<FarmerLogin />} />
              <Route path="/staff-login" element={<StaffLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/farmer-rejection" element={<FarmerRejection />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/checkout" element={<Checkout />} />

              {/* Private routes */}
              <Route
                path="/dashboard/farmer"
                element={
                  <PrivateRoute allowedRoles={['farmer']}>
                    <FarmerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/buyer"
                element={
                  <PrivateRoute allowedRoles={['buyer']}>
                    <BuyerDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/logistics"
                element={
                  <PrivateRoute allowedRoles={['logistics']}>
                    <LogisticsDashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="mt-16"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;