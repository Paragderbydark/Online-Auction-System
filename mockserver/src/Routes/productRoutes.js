import express from 'express';
import { changeProductStatus, createProduct, deleteProduct, getAllProducts, getLiveProducts, getPendingProducts, getProductById, getProductsBySeller, toggleAuctionDate, updateProduct } from '../Controllers/productController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/', getAllProducts);
router.get('/pending-products', verifyToken, requireRole(['admin']), getPendingProducts);
router.get('/live-products', verifyToken, requireRole(['admin']), getLiveProducts);
router.get('/:id', getProductById);

router.post('/', verifyToken, requireRole(['user', 'admin']), upload.array('images', 10), createProduct);
router.put('/:id', verifyToken, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'user') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Only users and admins can update products.'
  });
}, updateProduct);

router.put('/:id/status', verifyToken, requireRole(['admin']), (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Only admins can change product status.'
  });
}, changeProductStatus);

router.delete('/:id', verifyToken, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'user') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Only users and admins can delete products.'
  });
}, deleteProduct);

router.put('/:id/date', verifyToken, requireRole(['user', 'admin']), toggleAuctionDate);

router.get('/seller/:sellerId', verifyToken, getProductsBySeller);

router.get('/images/:productName/:imageName', (req, res) => {
  const { productName, imageName } = req.params;
  const imagePath = path.join(__dirname, '../../data/product-images', productName, imageName);
  res.sendFile(imagePath);
});

export default router;
