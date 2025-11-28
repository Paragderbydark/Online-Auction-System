import express from 'express';
import paymentController from '../Controllers/paymentController.js';

const router = express.Router();

router.get('/', paymentController.getAllPayments);

router.get('/:id', paymentController.getPaymentById);

router.post('/', paymentController.createPayment);

router.put('/:id', paymentController.updatePayment);

router.delete('/:id', paymentController.deletePayment);

router.get('/buyer/:buyerId', paymentController.getPaymentsByBuyer);

router.get('/seller/:sellerId', paymentController.getPaymentsBySeller);

router.get('/:id/status', paymentController.getPaymentStatus);

export default router;
