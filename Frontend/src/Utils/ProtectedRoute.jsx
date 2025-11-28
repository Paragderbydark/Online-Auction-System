import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getUserRole, isBuyer, isSeller, isAdmin } from './auth';

const ProtectedRoute = ({ children, requiredRole = null, requireBuyer = false, requireSeller = false, redirectTo = '/login' }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate(redirectTo);
      return;
    }

    if (requiredRole) {
      const userRole = getUserRole();
      const isUserAdmin = isAdmin();
      
      if (requiredRole === 'admin' || requiredRole === 'ADMIN') {
        if (!isUserAdmin) {
          if (isBuyer() && !isSeller()) {
            navigate('/buyer');
          } else if (isSeller() && !isBuyer()) {
            navigate('/seller');
          } else {
            navigate('/buyer');
          }
          return;
        }
      } else {
        if (userRole !== requiredRole && !userRole?.includes(requiredRole)) {
          if (isUserAdmin) {
            navigate('/admin');
          } else {
            navigate('/');
          }
          return;
        }
      }
    }

    if (requireBuyer && !isBuyer()) {
      console.log('Access denied: User is not a buyer');
      navigate('/');
      return;
    }

    if (requireSeller && !isSeller()) {
      console.log('Access denied: User is not a seller');
      navigate('/');
      return;
    }
  }, [requiredRole, requireBuyer, requireSeller, redirectTo, navigate]);

  if (!isAuthenticated()) {
    return null;
  }

  if (requiredRole) {
    const userRole = getUserRole();
    const isUserAdmin = isAdmin();
    
    if (requiredRole === 'admin' || requiredRole === 'ADMIN') {
      if (!isUserAdmin) {
        return null;
      }
    } else {
      if (userRole !== requiredRole && !userRole?.includes(requiredRole)) {
        return null;
      }
    }
  }

  if (requireBuyer && !isBuyer()) {
    return null;
  }

  if (requireSeller && !isSeller()) {
    return null;
  }

  return children;
};

export default ProtectedRoute;