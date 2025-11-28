import db from '../utils/database.js';

const detectCardType = (cardNumber) => {
  if (!cardNumber) return 'unknown';
  
  const number = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(number)) return 'visa';
  if (/^5[1-5]/.test(number)) return 'mastercard';
  if (/^3[47]/.test(number)) return 'amex';
  if (/^6/.test(number)) return 'discover';
  
  return 'unknown';
};

class PaymentController {
  getAllPayments(req, res) {
    try {
      const { buyerId, sellerId, status } = req.query;
      let payments = db.getAll('payments');

      if (buyerId) {
        payments = payments.filter(payment => payment.buyerId === buyerId);
      }

      if (sellerId) {
        payments = payments.filter(payment => payment.sellerId === sellerId);
      }

      if (status) {
        payments = payments.filter(payment => payment.status === status);
      }

      res.json({
        success: true,
        payments,
        count: payments.length
      });
    } catch (error) {
      console.error('Get all payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getPaymentById(req, res) {
    try {
      const { id } = req.params;
      const payment = db.getById('payments', id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        payment
      });
    } catch (error) {
      console.error('Get payment by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  createPayment(req, res) {
    try {
      const { 
        buyerId, 
        sellerId, 
        productId, 
        auctionId, 
        amount, 
        paymentMethod,
        cardDetails,
        billingInfo 
      } = req.body;

      if (!buyerId || !sellerId || !productId || !auctionId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: buyerId, sellerId, productId, auctionId, amount'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }

      const buyer = db.getById('buyers', buyerId);
      if (!buyer) {
        return res.status(404).json({
          success: false,
          message: 'Buyer not found'
        });
      }

      const seller = db.getById('sellers', sellerId);
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: 'Seller not found'
        });
      }

      const product = db.getById('products', productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const auction = db.getById('auctions', auctionId);
      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      const bids = db.getByQuery('bids', { auctionId });
      let finalAmount = parseFloat(amount);
      
      if (bids.length > 0) {
        const highestBid = Math.max(...bids.map(bid => parseFloat(bid.amount)));
        finalAmount = highestBid;
      } else {
        finalAmount = auction.startingPrice || parseFloat(amount);
      }

      const auctionFee = parseFloat((finalAmount * 0.05).toFixed(2));
      const shippingFee = 2500;
      const insuranceFee = 1000;
      const totalAmount = finalAmount + auctionFee + shippingFee + insuranceFee;

      const payments = db.getAll('payments');
      const id = String(payments.length > 0 ? Math.max(...payments.map(p => parseInt(p.id) || 0)) + 1 : 1);

      const processingTime = Math.random() * 2000 + 1000;

      const payment = {
        id,
        buyerId,
        sellerId,
        productId,
        auctionId,
        amount: finalAmount, 
        totalAmount: totalAmount, 
        paymentMethod: paymentMethod || 'card',
        status: 'processing',
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        processingTime,
        cardDetails: cardDetails ? {
          lastFourDigits: cardDetails.cardNumber ? cardDetails.cardNumber.slice(-4) : '****',
          cardType: detectCardType(cardDetails.cardNumber),
          expiryDate: cardDetails.expiryDate
        } : null,
        billingInfo: billingInfo ? {
          email: billingInfo.email,
          address: billingInfo.billingAddress
        } : null,
        fees: {
          auctionFee: auctionFee,
          shippingFee: shippingFee,
          insuranceFee: insuranceFee
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const savedPayment = db.create('payments', payment);

      if (!savedPayment) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment'
        });
      }

      setTimeout(() => {
        const isSuccessful = Math.random() > 0.1;
        
        const updatedPayment = db.update('payments', id, {
          status: isSuccessful ? 'completed' : 'failed',
          processedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...(isSuccessful && {
            confirmationNumber: `CONF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }),
          ...(!isSuccessful && {
            failureReason: 'Payment declined by bank'
          })
        });

        if (isSuccessful) {
          db.update('auctions', auctionId, {
            status: 'completed',
            paidAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          const notifications = db.getAll('notifications');
          const notificationId = String(notifications.length > 0 ? Math.max(...notifications.map(n => parseInt(n.id) || 0)) + 1 : 1);
          
          db.create('notifications', {
            id: notificationId,
            userId: buyer.userId,
            type: 'payment_success',
            title: 'Payment Successful',
            message: `Your payment of $${totalAmount.toLocaleString()} for ${product.title} has been processed successfully.`,
            isRead: false,
            createdAt: new Date().toISOString()
          });

          const sellerNotificationId = String(parseInt(notificationId) + 1);
          db.create('notifications', {
            id: sellerNotificationId,
            userId: seller.userId,
            type: 'payment_received',
            title: 'Payment Received',
            message: `Payment of $${totalAmount.toLocaleString()} received for ${product.title}.`,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      }, processingTime);

      res.status(201).json({
        success: true,
        message: 'Payment initiated successfully',
        payment: savedPayment,
        processingTime
      });
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  updatePayment(req, res) {
    try {
      const { id } = req.params;
      const { status, failureReason } = req.body;

      const existingPayment = db.getById('payments', id);
      if (!existingPayment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      const validStatuses = ['processing', 'completed', 'failed', 'pending', 'cancelled'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status'
        });
      }

      const updateData = {
        updatedAt: new Date().toISOString()
      };

      if (status) updateData.status = status;
      if (failureReason) updateData.failureReason = failureReason;

      if (status === 'completed' || status === 'failed') {
        updateData.processedAt = new Date().toISOString();
      }

      const updatedPayment = db.update('payments', id, updateData);

      if (!updatedPayment) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update payment'
        });
      }

      res.json({
        success: true,
        message: 'Payment updated successfully',
        payment: updatedPayment
      });
    } catch (error) {
      console.error('Update payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  deletePayment(req, res) {
    try {
      const { id } = req.params;

      const payment = db.getById('payments', id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      if (payment.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete completed payment'
        });
      }

      const deleted = db.delete('payments', id);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete payment'
        });
      }

      res.json({
        success: true,
        message: 'Payment deleted successfully'
      });
    } catch (error) {
      console.error('Delete payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getPaymentsByBuyer(req, res) {
    try {
      const { buyerId } = req.params;
      const payments = db.getByQuery('payments', { buyerId });

      res.json({
        success: true,
        payments,
        count: payments.length
      });
    } catch (error) {
      console.error('Get payments by buyer error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getPaymentsBySeller(req, res) {
    try {
      const { sellerId } = req.params;
      const payments = db.getByQuery('payments', { sellerId });

      res.json({
        success: true,
        payments,
        count: payments.length
      });
    } catch (error) {
      console.error('Get payments by seller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getPaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const payment = db.getById('payments', id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        status: payment.status,
        transactionId: payment.transactionId,
        amount: payment.amount,
        createdAt: payment.createdAt,
        processedAt: payment.processedAt || null,
        confirmationNumber: payment.confirmationNumber || null
      });
    } catch (error) {
      console.error('Get payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new PaymentController();
