import db from '../utils/database.js';
import bcrypt from 'bcryptjs';

class UserController {
  getAllUsers(req, res) {
    try {
      const { role, isBuyer, isSeller } = req.query;
      let users = db.getAll('users');

      if (role) {
        users = users.filter(user => user.role === role);
      }

      if (isBuyer !== undefined) {
        const buyerFilter = isBuyer === 'true';
        users = users.filter(user => user.role !== 'admin' && user.isBuyer === buyerFilter);
      }

      if (isSeller !== undefined) {
        const sellerFilter = isSeller === 'true';
        users = users.filter(user => user.role !== 'admin' && user.isSeller === sellerFilter);
      }

      const usersResponse = users.map(({ password, ...user }) => user);

      res.json({
        success: true,
        users: usersResponse
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = db.getById('users', id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const { password, ...userResponse } = user;

      res.json({
        success: true,
        user: userResponse
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { username, email, role, password, isBuyer, isSeller } = req.body;

      const existingUser = db.getById('users', id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (email && email !== existingUser.email) {
        const users = db.getAll('users');
        const emailExists = users.find(user => user.email === email && user.id !== id);
        if (emailExists) {
          return res.status(409).json({
            success: false,
            message: 'Email already taken by another user'
          });
        }
      }

      const updateData = {
        updatedAt: new Date().toISOString()
      };

      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (isBuyer !== undefined) updateData.isBuyer = isBuyer;
      if (isSeller !== undefined) updateData.isSeller = isSeller;
      
      if (isBuyer !== undefined || isSeller !== undefined) {
        const newIsBuyer = isBuyer !== undefined ? isBuyer : existingUser.isBuyer;
        const newIsSeller = isSeller !== undefined ? isSeller : existingUser.isSeller;
        
        if (newIsBuyer && !existingUser.buyerId) {
          const buyers = db.getAll('buyers') || [];
          const buyerId = String(buyers.length > 0 ? Math.max(...buyers.map(b => parseInt(b.id) || 0)) + 1 : 1);
          updateData.buyerId = buyerId;
          
          db.create('buyers', {
            id: buyerId,
            userId: id,
            username: username || existingUser.username,
            email: email || existingUser.email,
            createdAt: new Date().toISOString()
          });
        }
        
        if (newIsSeller && !existingUser.sellerId) {
          const sellers = db.getAll('sellers') || [];
          const sellerId = String(sellers.length > 0 ? Math.max(...sellers.map(s => parseInt(s.id) || 0)) + 1 : 1);
          updateData.sellerId = sellerId;
          
          db.create('sellers', {
            id: sellerId,
            userId: id,
            username: username || existingUser.username,
            email: email || existingUser.email,
            createdAt: new Date().toISOString()
          });
        }
      }
      
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = db.update('users', id, updateData);

      if (!updatedUser) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update user'
        });
      }

      const { password: _, ...userResponse } = updatedUser;

      res.json({
        success: true,
        message: 'User updated successfully',
        user: userResponse
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  deleteUser(req, res) {
    try {
      const { id } = req.params;

      const user = db.getById('users', id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const deleted = db.delete('users', id);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete user'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getUsersByRole(req, res) {
    try {
      const { role } = req.params;
      const users = db.getByQuery('users', { role });

      const usersResponse = users.map(({ password, ...user }) => user);

      res.json({
        success: true,
        users: usersResponse,
        count: usersResponse.length
      });
    } catch (error) {
      console.error('Get users by role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getAllBuyers(req, res) {
    try {
      const buyers = db.getAll('buyers');
      
      res.json({
        success: true,
        buyers,
        count: buyers.length
      });
    } catch (error) {
      console.error('Get all buyers error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getAllSellers(req, res) {
    try {
      const sellers = db.getAll('sellers');
      
      res.json({
        success: true,
        sellers,
        count: sellers.length
      });
    } catch (error) {
      console.error('Get all sellers error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getBuyerById(req, res) {
    try {
      const { id } = req.params;
      const buyer = db.getById('buyers', id);

      if (!buyer) {
        return res.status(404).json({
          success: false,
          message: 'Buyer not found'
        });
      }

      res.json({
        success: true,
        buyer
      });
    } catch (error) {
      console.error('Get buyer by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getSellerById(req, res) {
    try {
      const { id } = req.params;
      const seller = db.getById('sellers', id);

      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller not found'
        });
      }

      res.json({
        success: true,
        seller
      });
    } catch (error) {
      console.error('Get seller by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new UserController();
