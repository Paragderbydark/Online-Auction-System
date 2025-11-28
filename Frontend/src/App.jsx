import React from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'

import Landingpage from './Pages/User/Landingpage'
import LoginPage from './Pages/User/LoginPage'
import RegisterPage from './Pages/User/RegisterPage'
import UserProfile from './Pages/User/UserProfile'
import RoleSelection from './Pages/User/RoleSelection'
import ResetPassword from './Pages/User/ResetPassword'

import AdminHomePage from './Pages/Admin/AdminHomePage'
import AdminProductDetails from './Pages/Admin/AdminProductDetails'
import AdminReviewPage from './Pages/Admin/AdminReviewPage'
import AdminPaymentsPage from './Pages/Admin/AdminPaymentsPage'
import AdminUsersPage from './Pages/Admin/AdminUsersPage'
import AdminAuctionsPage from './Pages/Admin/AdminAuctionsPage'

import SellerHomePage from './Pages/Seller/SellerHomePage'
import AddProduct from './Pages/Seller/AddProduct'
import SellerProductDetails from './Pages/Seller/SellerProductDetails'
import EditProduct from './Pages/Seller/EditProduct'
import SellerPaymentsPage from './Pages/Seller/SellerPaymentsPage'
import SellerReviewsPage from './Pages/Seller/SellerReviewsPage'

import BuyerHomePage from './Pages/Buyer/BuyerHomePage'
import BuyerProductDetails from './Pages/Buyer/BuyerProductDetails'
import PaymentPage from './Pages/Buyer/PaymentPage'

import BuyerReviewsPage from './Pages/Buyer/BuyerReviewsPage'
import BuyerPaymentsPage from './Pages/Buyer/BuyerPaymentsPage'

import ProtectedRoute from './Utils/ProtectedRoute'


function App() {

  return (
    <div className="w-full min-h-screen">
      <Routes>
        <Route path='/' element={<Landingpage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/role-selection' element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
        
        <Route path='/buyer' element={<ProtectedRoute requireBuyer={true}><BuyerHomePage /></ProtectedRoute>} />
        <Route path='/buyer/product-details' element={<ProtectedRoute requireBuyer={true}><BuyerProductDetails /></ProtectedRoute>} />
        <Route path='/buyer/payment' element={<ProtectedRoute requireBuyer={true}><PaymentPage /></ProtectedRoute>} />
        <Route path='/buyer/reviews' element={<ProtectedRoute requireBuyer={true}><BuyerReviewsPage /></ProtectedRoute>} />
        <Route path='/buyer/payments' element={<ProtectedRoute requireBuyer={true}><BuyerPaymentsPage /></ProtectedRoute>} />

        <Route path='/seller' element={<ProtectedRoute requireSeller={true}><SellerHomePage /></ProtectedRoute>} />
        <Route path='/seller/add-product' element={<ProtectedRoute requireSeller={true}><AddProduct /></ProtectedRoute>} />
        <Route path='/seller/product-details' element={<ProtectedRoute requireSeller={true}><SellerProductDetails /></ProtectedRoute>} />
        <Route path='/seller/edit-product' element={<ProtectedRoute requireSeller={true}><EditProduct /></ProtectedRoute>} />
        <Route path='/seller/payments' element={<ProtectedRoute requireSeller={true}><SellerPaymentsPage /></ProtectedRoute>} />
        <Route path='/seller/reviews' element={<ProtectedRoute requireSeller={true}><SellerReviewsPage /></ProtectedRoute>} />

        <Route path='/admin' element={<ProtectedRoute requiredRole="admin"><AdminHomePage /></ProtectedRoute>} />
        <Route path='/admin/auctions' element={<ProtectedRoute requiredRole="admin"><AdminAuctionsPage /></ProtectedRoute>} />
        <Route path='/admin/users' element={<ProtectedRoute requiredRole="admin"><AdminUsersPage /></ProtectedRoute>} />
        <Route path='/admin/reviews' element={<ProtectedRoute requiredRole="admin"><AdminReviewPage /></ProtectedRoute>} />
        <Route path='/admin/product-details' element={<ProtectedRoute requiredRole="admin"><AdminProductDetails /></ProtectedRoute>} />
        <Route path='/admin/payments' element={<ProtectedRoute requiredRole="admin"><AdminPaymentsPage /></ProtectedRoute>} />

        <Route path='/userprofile' element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path='/reset-password' element={<ResetPassword />} />

      </Routes>
      
    </div>
  )
}

export default App
