import config from './config';
import { SERVER_URL } from './config';
import axios from 'axios';

export const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('authToken');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);
  } else {
    clearAuthStorage();
  }
};

export const setUserData = (userData) => {
  if (userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  }
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp && payload.exp < currentTime) {
      setAuthToken(null);
      return false;
    }
    
    return true;
  } catch (error) {
    setAuthToken(null);
    return false;
  }
};

export const logout = async (navigate = null) => {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (token) {
      const response = await axios.post(`${SERVER_URL}/auth/logout`, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        console.log('Logout response:', response.data);
      }
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuthStorage();
    
    if (navigate && typeof navigate === 'function') {
      navigate('/login');
    } else {
      window.location.href = '/login';
    }
  }
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
};

export const getUserData = () => {
  const token = getAuthToken();
  if (!token || !isAuthenticated()) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    const userStr = localStorage.getItem('user');
    let userData = null;
    if (userStr) {
      try {
        userData = JSON.parse(userStr);
      } catch (e) {
        console.warn('Failed to parse user data from localStorage:', e);
      }
    }
    
    const tokenRoles = payload.roles || [];
    const storedRoles = userData?.roles || [];
    const allRoles = [...tokenRoles, ...storedRoles];
    
    // console.log('Token roles:', tokenRoles);
    // console.log('Stored roles:', storedRoles);
    
    const userId = payload.userId || userData?.userId || payload.id || payload.sub || null;
    // console.log('Extracted userId:', userId);
    
    const normalizedRoles = Array.isArray(allRoles) ? allRoles.map(role => {
      if (typeof role === 'string') {
        if (role.startsWith('ROLE_')) return role;
        return `ROLE_${role.toUpperCase()}`;
      }
      return role;
    }) : [];
    
    // console.log('Normalized roles:', normalizedRoles);    
    const result = {
      id: userId,
      userId: userId,
      username: payload.username || userData?.username || payload.user || payload.sub || 'User',
      email: payload.email || userData?.email || '',
      roles: normalizedRoles,
      isBuyer: normalizedRoles.includes('ROLE_BUYER'),
      isSeller: normalizedRoles.includes('ROLE_SELLER'),
      isAdmin: normalizedRoles.includes('ROLE_ADMIN'),
    };
    
    // console.log('Final user data result:', result); // Debug log
    return result;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const getUserRole = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const roles = payload.roles;
    const userRoles = [];
    
    if (roles && Array.isArray(roles) && roles.length > 0) {
      if (roles.includes('ADMIN') || roles.includes('ROLE_ADMIN')) userRoles.push('ADMIN ');
      if (roles.includes('SELLER') || roles.includes('ROLE_SELLER')) userRoles.push('SELLER ');
      if (roles.includes('BUYER') || roles.includes('ROLE_BUYER')) userRoles.push('BUYER ');
      return userRoles;
    }
    
    return payload.role || 'BUYER';
  } catch (error) {
    console.error('Error decoding token for role:', error);
    
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
          if (user.roles.includes('ROLE_ADMIN') || user.roles.includes('ADMIN')) return 'ADMIN';
          if (user.roles.includes('ROLE_SELLER') || user.roles.includes('SELLER')) return 'SELLER';
          if (user.roles.includes('ROLE_BUYER') || user.roles.includes('BUYER')) return 'BUYER';
          return user.roles[0];
        }
        if (user.isAdmin) return 'ADMIN';
        if (user.isSeller && !user.isBuyer) return 'SELLER';
        return 'BUYER';
      }
    } catch (e) {
      console.error('Error parsing user data from localStorage:', e);
    }
    
    return null;
  }
};

export const getUserInfo = () => {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const roles = payload.roles || [];
    const userId = payload.userId || payload.id || null;
    
    // Normalize roles to include ROLE_ prefix if missing
    const normalizedRoles = Array.isArray(roles) ? roles.map(role => {
      if (typeof role === 'string') {
        if (role.startsWith('ROLE_')) return role;
        return `ROLE_${role.toUpperCase()}`;
      }
      return role;
    }) : [];
    
    return {
      id: userId,
      userId: userId,
      username: payload.username || payload.user || 'User',
      email: payload.email || '',
      roles: normalizedRoles,
      role: normalizedRoles.length > 0 ? normalizedRoles[0] : 'ROLE_BUYER',
      isBuyer: normalizedRoles.includes('ROLE_BUYER'),
      isSeller: normalizedRoles.includes('ROLE_SELLER'),
      isAdmin: normalizedRoles.includes('ROLE_ADMIN'),
      buyerId: normalizedRoles.includes('ROLE_BUYER') ? userId : null,
      sellerId: normalizedRoles.includes('ROLE_SELLER') ? userId : null
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isBuyer = () => {
  const userData = getUserData();
  if (userData && typeof userData.isBuyer === 'boolean') {
    return userData.isBuyer;
  }
  
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.isBuyer === true;
    }
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
  }
  
  return false;
};

export const isSeller = () => {
  const userData = getUserData();
  if (userData && typeof userData.isSeller === 'boolean') {
    return userData.isSeller;
  }
  
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.isSeller === true;
    }
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
  }
  
  return false;
};

export const isAdmin = () => {
  const userData = getUserData();
  if (userData && userData.isAdmin) {
    return true;
  }
  
  const userRole = getUserRole();
  return userRole === 'ADMIN' || userRole === 'admin';
};

export const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('userData');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('auth');
  localStorage.removeItem('session');
  
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('userData');
  sessionStorage.removeItem('userInfo');
  sessionStorage.removeItem('auth');
  sessionStorage.removeItem('session');
  
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
  
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export const debugAuthState = () => {
  console.group('Authentication Debug Info');
  
  const token = getAuthToken();
  console.log('Token from storage:', token ? `${token.substring(0, 20)}...` : 'No token');
  
  const userFromStorage = localStorage.getItem('user');
  console.log('👤 User from localStorage:', userFromStorage);
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); //header payload, signature.
      console.log('Token payload:', payload);
      console.log('Roles from token:', payload.roles);
      console.log('UserId from token:', payload.userId);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }
  
  const userData = getUserData();
  console.log('getUserData() result:', userData);
  
  console.log('isAuthenticated():', isAuthenticated());
  console.log('getUserRole():', getUserRole());
  console.log('isBuyer():', isBuyer());
  console.log('isSeller():', isSeller());
  console.log('isAdmin():', isAdmin());

  console.groupEnd();
};

export const handleLoginSuccess = (loginResponse) => {
  try {
    
    const { token, username, email, userId, roles } = loginResponse.data || loginResponse;
    
    
    if (!token) {
      console.error('No token in login response');
      throw new Error('No token received');
    }
    
    setAuthToken(token);
    
    const normalizedRoles = Array.isArray(roles) ? roles.map(role => {
      if (typeof role === 'string') {
        if (role.startsWith('ROLE_')) return role;
        return `ROLE_${role.toUpperCase()}`;
      }
      return role;
    }) : ['ROLE_BUYER'];
    
    const userData = {
      userId: userId,
      username: username,
      email: email,
      roles: normalizedRoles,
      isBuyer: normalizedRoles.includes('ROLE_BUYER'),
      isSeller: normalizedRoles.includes('ROLE_SELLER'),
      isAdmin: normalizedRoles.includes('ROLE_ADMIN'),
      buyerId: normalizedRoles.includes('ROLE_BUYER') ? userId : null,
      sellerId: normalizedRoles.includes('ROLE_SELLER') ? userId : null
    };
    
    setUserData(userData);
    
    // console.log('✅ Login success - stored user data:', userData);
    // console.log('✅ Token stored, auth check:', isAuthenticated());
    
    return userData;
  } catch (error) {
    console.error('Error handling login success:', error);
    throw error;
  }
};

export const assignSellerRoleToCurrentUser = async () => {
  try {
    const userData = getUserData();
    if (!userData || !userData.userId) {
      console.error('No user logged in');
      return false;
    }

    const response = await axios.post(`${SERVER_URL}/users/assign-seller-role/${userData.userId}`, {}, {
      headers: getAuthHeaders()
    });

    if (response.status === 200) {
      // console.log('✅ Seller role assigned:', response.data);
      
      // Clear auth storage and ask user to login again to get updated token
      // console.log('🔄 Please logout and login again to get updated roles');
      alert('Seller role assigned! Please logout and login again to access seller features.');
      return true;
    } else {
      console.error('❌ Failed to assign seller role:', response.data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error assigning seller role:', error);
    return false;
  }
};