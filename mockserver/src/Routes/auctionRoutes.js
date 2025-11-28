import express from 'express';
const router = express.Router();
import auctionController from '../Controllers/auctionController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { validateAuction } from '../middleware/validation.js';


router.get('/', auctionController.getAllAuctions);

router.get('/:id', auctionController.getAuctionById);


router.post('/', verifyToken, requireRole(['user', 'admin']), validateAuction, auctionController.createAuction);


router.put('/:id', verifyToken, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'user') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Only users and admins can update auctions.'
  });
}, auctionController.updateAuction);


router.delete('/:id', verifyToken, (req, res, next) => {

  if (req.user.role === 'admin' || req.user.role === 'user') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Only users and admins can delete auctions.'
  });
}, auctionController.deleteAuction);


router.get('/seller/:sellerId', auctionController.getAuctionsBySeller);


router.get('/product/:productId', auctionController.getAuctionsByProduct);

export default router;
