import express from 'express';
import biddingController from '../Controllers/biddingController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { validateBid } from '../middleware/validation.js';

const router = express.Router();

router.get('/', biddingController.getAllBids);

router.post('/', verifyToken, requireRole(['user', 'admin']), validateBid, biddingController.placeBid);

router.get('/:productId', biddingController.getBidsByProduct);

router.get('/bid/:id', biddingController.getBidById);

router.put('/:id/buyer/:buyerId', verifyToken, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === req.params.buyerId) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only update your own bids.'
  });
}, biddingController.updateBid);

router.delete('/:id', verifyToken, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'user') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Only users and admins can delete bids.'
  });
}, biddingController.deleteBid);

router.get('/buyer/:buyerId', verifyToken, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === req.params.buyerId) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own bids.'
  });
}, biddingController.getBidsByBuyer);


router.get('/auction/:auctionId/highest', biddingController.getHighestBid);

export default router;
