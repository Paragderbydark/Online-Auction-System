import bcrypt from 'bcryptjs';
import db from '../utils/database.js';
import { generateToken } from '../middleware/auth.js';

export const register = async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { username, email, password, isBuyer = false, isSeller = false } = req.body;

    if (!isBuyer && !isSeller) {
      console.log('Validation failed: No role selected');
      return res.status(400).json({
        success: false,
        message: 'Please select at least one role: Buyer or Seller'
      });
    }

    const users = db.getAll('users');
    const existingUser = users.find(user => user.email === email);
    
    if (existingUser) {
      console.log('User already exists with email:', email);
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    let buyerId = null;
    let sellerId = null;
    
    if (isBuyer) {
      try {
        const buyers = db.getAll('buyers') || [];
        buyerId = String(buyers.length > 0 ? Math.max(...buyers.map(b => parseInt(b.id) || 0)) + 1 : 1);
      } catch (error) {
        console.warn('Buyers collection not found, creating first buyer with ID 1');
        buyerId = "1";
      }
    }
    
    if (isSeller) {
      try {
        const sellers = db.getAll('sellers') || [];
        sellerId = String(sellers.length > 0 ? Math.max(...sellers.map(s => parseInt(s.id) || 0)) + 1 : 1);
      } catch (error) {
        console.warn('Sellers collection not found, creating first seller with ID 1');
        sellerId = "1";
      }
    }

    const newUser = db.create('users', {
      username,
      email,
      password: hashedPassword,
      role: 'user',
      isBuyer,
      isSeller,
      buyerId,
      sellerId,
      createdAt: new Date().toISOString()
    });

    console.log('New user created:', newUser);

    if (!newUser) {
      console.log('Failed to create user');
      return res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }

    if (isBuyer && buyerId) {
      try {
        db.create('buyers', {
          id: buyerId,
          userId: newUser.id,
          username,
          email,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error creating buyer record:', error);
      }
    }

    if (isSeller && sellerId) {
      try {
        db.create('sellers', {
          id: sellerId,
          userId: newUser.id,
          username,
          email,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error creating seller record:', error);
      }
    }

    const token = generateToken(newUser);

    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = db.getAll('users');
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user);

    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie('token');
    res.clearCookie('user');
    res.clearCookie('connect.sid');
    res.clearCookie('session');
    res.clearCookie('auth');
    
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({
            success: false,
            message: "Error logging out",
            clearStorage: true
          });
        }

        return res.status(200).json({
          success: true,
          message: "Logged out successfully",
          clearStorage: true
        });
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Logged out successfully", 
        clearStorage: true 
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: "Error logging out",
      clearStorage: true
    });
  }
};

export const getProfile = (req, res) => {
  try {
    const user = db.getById('users', req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
