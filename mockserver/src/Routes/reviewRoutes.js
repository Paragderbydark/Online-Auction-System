import express from 'express';
import reviewController from '../Controllers/reviewController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { validateReview } from '../middleware/validation.js';

const router = express.Router();

router.get('/', reviewController.getAllReviews);

router.get('/:id', reviewController.getReviewById);

router.post('/', verifyToken, requireRole(['user', 'admin']), validateReview, reviewController.createReview);

router.put('/:id', verifyToken, reviewController.updateReview);

router.delete('/:id', verifyToken, reviewController.deleteReview);

router.get('/product/:productId', reviewController.getReviewsByProduct);

router.get('/seller/:sellerId', reviewController.getReviewsBySeller);

router.get('/user/:userId', verifyToken, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.id === req.params.userId) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own reviews.'
  });
}, reviewController.getReviewsByUser);

router.put('/:id/helpful', verifyToken, reviewController.markHelpful);

export default router;