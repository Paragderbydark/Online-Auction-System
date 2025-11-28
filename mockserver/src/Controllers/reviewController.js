import db from '../utils/database.js';

class ReviewController {
  getAllReviews(req, res) {
    try {
      const { productId, sellerId, userId } = req.query;
      let reviews = db.getAll('reviews');

      if (productId) {
        reviews = reviews.filter(review => review.productId === productId);
      }

      if (sellerId) {
        reviews = reviews.filter(review => review.sellerId === sellerId);
      }

      if (userId) {
        reviews = reviews.filter(review => review.userId === userId);
      }

      res.json({
        success: true,
        reviews,
        count: reviews.length
      });
    } catch (error) {
      console.error('Get all reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getReviewById(req, res) {
    try {
      const { id } = req.params;
      const review = db.getById('reviews', id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      res.json({
        success: true,
        review
      });
    } catch (error) {
      console.error('Get review by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  createReview(req, res) {
    try {
      const {
        productId,
        sellerId,
        userId,
        rating,
        comment,
        title
      } = req.body;

      if (!productId && !sellerId) {
        return res.status(400).json({
          success: false,
          message: 'Either productId or sellerId must be provided'
        });
      }

      if (productId) {
        const product = db.getById('products', productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Product not found'
          });
        }
      }

      if (sellerId) {
        const seller = db.getById('users', sellerId);
        if (!seller) {
          return res.status(404).json({
            success: false,
            message: 'Seller not found'
          });
        }
      }

      const existingReviews = db.getAll('reviews');
      const existingReview = existingReviews.find(review => 
        review.userId === (userId || req.user?.id) && 
        ((productId && review.productId === productId) || 
         (sellerId && review.sellerId === sellerId))
      );

      if (existingReview) {
        return res.status(409).json({
          success: false,
          message: 'You have already reviewed this item'
        });
      }

      const newReview = db.create('reviews', {
        productId,
        sellerId,
        userId: userId || req.user?.id,
        rating: parseInt(rating),
        comment: comment || '',
        title: title || '',
        status: 'active',
        helpful: 0,
        createdAt: new Date().toISOString()
      });

      if (!newReview) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create review'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        review: newReview
      });
    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  updateReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, comment, title } = req.body;

      const existingReview = db.getById('reviews', id);
      if (!existingReview) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      if (req.user && existingReview.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own reviews'
        });
      }

      const updateData = {
        updatedAt: new Date().toISOString()
      };

      if (rating !== undefined) updateData.rating = parseInt(rating);
      if (comment !== undefined) updateData.comment = comment;
      if (title !== undefined) updateData.title = title;

      const updatedReview = db.update('reviews', id, updateData);

      if (!updatedReview) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update review'
        });
      }

      res.json({
        success: true,
        message: 'Review updated successfully',
        review: updatedReview
      });
    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  deleteReview(req, res) {
    try {
      const { id } = req.params;

      const review = db.getById('reviews', id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      if (req.user && review.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own reviews'
        });
      }

      const deleted = db.delete('reviews', id);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete review'
        });
      }

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getReviewsByProduct(req, res) {
    try {
      const { productId } = req.params;
      const reviews = db.getByQuery('reviews', { productId });

      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      res.json({
        success: true,
        reviews,
        count: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10
      });
    } catch (error) {
      console.error('Get reviews by product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getReviewsBySeller(req, res) {
    try {
      const { sellerId } = req.params;
      const reviews = db.getByQuery('reviews', { sellerId });

      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      res.json({
        success: true,
        reviews,
        count: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10
      });
    } catch (error) {
      console.error('Get reviews by seller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getReviewsByUser(req, res) {
    try {
      const { userId } = req.params;
      const reviews = db.getByQuery('reviews', { userId });

      res.json({
        success: true,
        reviews,
        count: reviews.length
      });
    } catch (error) {
      console.error('Get reviews by user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  markHelpful(req, res) {
    try {
      const { id } = req.params;

      const review = db.getById('reviews', id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      const updatedReview = db.update('reviews', id, {
        helpful: (review.helpful || 0) + 1,
        updatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Review marked as helpful',
        review: updatedReview
      });
    } catch (error) {
      console.error('Mark helpful error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new ReviewController();
