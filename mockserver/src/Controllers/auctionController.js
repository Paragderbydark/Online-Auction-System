import db from '../utils/database.js';

class AuctionController {
  getAllAuctions(req, res) {
    try {
      const { sellerId, productId } = req.query;
      let auctions = db.getAll('auctions');

      if (sellerId) {
        auctions = auctions.filter(auction => auction.sellerId === sellerId);
      }

      if (productId) {
        auctions = auctions.filter(auction => auction.productId === productId);
      }

      res.json({
        success: true,
        auctions,
        products: auctions,
        count: auctions.length
      });
    } catch (error) {
      console.error('Get all auctions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getAuctionById(req, res) {
    try {
      const { id } = req.params;
      const auction = db.getById('auctions', id);

      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      res.json({
        success: true,
        auction
      });
    } catch (error) {
      console.error('Get auction by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  createAuction(req, res) {
    try {
      const {
        auctionId,
        productId,
        sellerId,
        startTime,
        endTime,
        startingPrice,
        currentPrice,
        status
      } = req.body;

      const product = db.getById('products', productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const newAuction = db.create('auctions', {
        auctionId: auctionId || `AUC-${Date.now()}`,
        productId,
        sellerId: sellerId || req.user.id,
        startTime: startTime || new Date().toISOString(),
        endTime: endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        startingPrice: startingPrice || product.starting_price || 0,
        currentPrice: currentPrice || product.starting_price || 0,
        status: status || 'active',
        bidCount: 0,
        createdAt: new Date().toISOString()
      });

      if (!newAuction) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create auction'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Auction created successfully',
        auction: newAuction
      });
    } catch (error) {
      console.error('Create auction error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  updateAuction(req, res) {
    try {
      const { id } = req.params;
      const {
        auctionId,
        startTime,
        endTime,
        startingPrice,
        currentPrice,
        status
      } = req.body;

      const existingAuction = db.getById('auctions', id);
      if (!existingAuction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      const updateData = {
        updatedAt: new Date().toISOString()
      };

      if (auctionId) updateData.auctionId = auctionId;
      if (startTime) updateData.startTime = startTime;
      if (endTime) updateData.endTime = endTime;
      if (startingPrice !== undefined) updateData.startingPrice = startingPrice;
      if (currentPrice !== undefined) updateData.currentPrice = currentPrice;
      if (status) updateData.status = status;

      const updatedAuction = db.update('auctions', id, updateData);

      if (!updatedAuction) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update auction'
        });
      }

      res.json({
        success: true,
        message: 'Auction updated successfully',
        auction: updatedAuction
      });
    } catch (error) {
      console.error('Update auction error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  deleteAuction(req, res) {
    try {
      const { id } = req.params;

      const auction = db.getById('auctions', id);
      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found'
        });
      }

      const deleted = db.delete('auctions', id);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete auction'
        });
      }

      res.json({
        success: true,
        message: 'Auction deleted successfully'
      });
    } catch (error) {
      console.error('Delete auction error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getAuctionsBySeller(req, res) {
    try {
      const { sellerId } = req.params;
      const auctions = db.getByQuery('auctions', { sellerId });

      res.json({
        success: true,
        auctions,
        products: auctions,
        count: auctions.length
      });
    } catch (error) {
      console.error('Get auctions by seller error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getAuctionsByProduct(req, res) {
    try {
      const { productId } = req.params;
      const auctions = db.getByQuery('auctions', { productId });

      res.json({
        success: true,
        auctions,
        products: auctions,
        count: auctions.length
      });
    } catch (error) {
      console.error('Get auctions by product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new AuctionController();
