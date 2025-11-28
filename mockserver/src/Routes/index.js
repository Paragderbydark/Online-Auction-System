import express from 'express';
import authRoutes from '../Routes/authRoutes.js';
import userRoutes from '../Routes/userRoutes.js';
import productRoutes from '../Routes/productRoutes.js';
import auctionRoutes from '../Routes/auctionRoutes.js';
import biddingRoutes from '../Routes/biddingRoutes.js';
import reviewRoutes from '../Routes/reviewRoutes.js';
import notificationRoutes from '../Routes/notificationRoutes.js';
import paymentRoutes from '../Routes/paymentRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/auctions', auctionRoutes);
router.use('/bidding', biddingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/payments', paymentRoutes);

export default router;
