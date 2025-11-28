import db from '../utils/database.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllProducts = (req, res) => {
  try {
    const { sellerId } = req.query;
    let products = db.getAll('products');

    if (sellerId) {
      products = products.filter(product => product.sellerId === sellerId);
    }

    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const getProductById = (req, res) => {
  try {
    const { id } = req.params;
    const product = db.getById('products', id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const createProduct = (req, res) => {
  try {
    const {
      product_model,
      model_year,
      auction_date,
      auction_time,
      auction_duration,
      starting_price,
      reserve_price,
      description,
      category,
      status
    } = req.body;

    if (!product_model) {
      return res.status(400).json({
        success: false,
        message: 'Product model is required'
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    const product_images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const relativePath = path.relative(
          path.join(__dirname, '../../data'),
          file.path
        ).replace(/\\/g, '/');
        product_images.push(relativePath);
      });
    }

    const sellerId = req.user?.sellerId || req.user?.id;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Seller ID is required'
      });
    }

    const newProduct = db.create('products', {
      product_model,
      model_year: parseInt(model_year),
      auction_date,
      auction_time,
      auction_duration: parseInt(auction_duration),
      starting_price: parseFloat(starting_price),
      reserve_price: parseFloat(reserve_price),
      description,
      category: category || 'General',
      status: status || 'pending',
      product_images,
      sellerId: sellerId.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    if (!newProduct) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create product'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_model,
      product_images,
      description,
      auction_date,
      year,
      time,
      starting_price,
      category,
      status
    } = req.body;

    const existingProduct = db.getById('products', id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (product_model) updateData.product_model = product_model;
    if (product_images) updateData.product_images = product_images;
    if (description) updateData.description = description;
    if (auction_date) updateData.auction_date = auction_date;
    if (year) updateData.year = year;
    if (time) updateData.time = time;
    if (starting_price !== undefined) updateData.starting_price = starting_price;
    if (category) updateData.category = category;
    if (status) updateData.status = status;

    const updatedProduct = db.update('products', id, updateData);

    if (!updatedProduct) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update product'
      });
    }
    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const deleteProduct = (req, res) => {
  try {
    const { id } = req.params;

    const product = db.getById('products', id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const deleted = db.delete('products', id);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete product'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const toggleAuctionDate = (req, res) => {
  try {
    const { id } = req.params;

    const product = db.getById('products', id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const currentStatus = product.status || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    const updatedProduct = db.update('products', id, {
      status: newStatus,
      auctionStateToggled: true,
      updatedAt: new Date().toISOString()
    });
    res.json({
      success: true,
      message: 'Auction state toggled successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Toggle auction date error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const getProductsBySeller = (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Seller ID is required'
      });
    }

    const products = db.getByQuery('products', { sellerId: sellerId.toString() });

    console.log(`Fetching products for seller ID: ${sellerId}`);
    console.log(`Found ${products.length} products`);

    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Get products by seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const getPendingProducts = (req, res) => {
  try {

    const products = db.getByQuery('products', { status: 'pending' });
    console.log(`Found ${products.length} pending products`);

    res.json({
      success: true,
      products,
      count: products.length
    });

  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const getLiveProducts = (req, res) => {
  try {

    const products = db.getByQuery('products', { status: 'active' });

    res.json({
      success: true,
      products,
      count: products.length
    });

  } catch (error) {
    console.error('Get pending products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const changeProductStatus = (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;

    const product = db.getById('products', id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedProduct = db.update('products', id, { status });
    res.json({
      success: true,
      message: 'Product status updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Change product status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

