import db from '../utils/database.js';

class BiddingController {
  getAllBids(req, res) {
    try {
      const { productId, auctionId, buyerId } = req.query;
      let bids = db.getAll('bids');

      if (productId) {
        bids = bids.filter(bid => bid.productId === productId);
      }

      if (auctionId) {
        bids = bids.filter(bid => bid.auctionId === auctionId);
      }

      if (buyerId) {
        bids = bids.filter(bid => bid.buyerId === buyerId);
      }

      res.json({
        success: true,
        biddings: bids,
        bid: bids,
        count: bids.length
      });
    } catch (error) {
      console.error('Get all bids error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getBidsByProduct(req, res) {
    try {
      const { productId } = req.params;
      const bids = db.getByQuery('bids', { productId });

      res.json({
        success: true,
        biddings: bids,
        count: bids.length
      });
    } catch (error) {
      console.error('Get bids by product error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getBidById(req, res) {
    try {
      const { id } = req.params;
      const bid = db.getById('bids', id);

      if (!bid) {
        return res.status(404).json({
          success: false,
          message: 'Bid not found'
        });
      }

      res.json({
        success: true,
        bid
      });
    } catch (error) {
      console.error('Get bid by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  placeBid(req, res) {
    try {
      const {
        auctionId,
        productId,
        amount,
        buyerId
      } = req.body;

      let auction = null;
      if (auctionId) {
        auction = db.getById('auctions', auctionId);
        if (!auction) {
          return res.status(404).json({
            success: false,
            message: 'Auction not found'
          });
        }

        if (auction.status !== 'active') {
          return res.status(400).json({
            success: false,
            message: 'Auction is not active'
          });
        }
      }

      let product = null;
      if (productId) {
        product = db.getById('products', productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Product not found'
          });
        }

        if (!auctionId) {
          const existingAuctions = db.getByQuery('auctions', { productId });
          if (existingAuctions.length > 0) {
            auction = existingAuctions.find(a => a.status === 'active') || existingAuctions[0];
          } else {
            const newAuction = db.create('auctions', {
              auctionId: `AUC-${Date.now()}`,
              productId,
              sellerId: product.sellerId,
              startTime: new Date().toISOString(),
              endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              startingPrice: product.starting_price || 0,
              currentPrice: product.starting_price || 0,
              status: 'active',
              bidCount: 0,
              createdAt: new Date().toISOString()
            });
            
            if (!newAuction) {
              return res.status(500).json({
                success: false,
                message: 'Failed to create auction for product'
              });
            }
            auction = newAuction;
          }
        }
      }

      const existingBids = auctionId 
        ? db.getByQuery('bids', { auctionId })
        : db.getByQuery('bids', { productId });

      const highestBid = existingBids.length > 0 
        ? Math.max(...existingBids.map(bid => parseFloat(bid.amount)))
        : 0;

      const startingPrice = auction ? auction.startingPrice : (product ? product.starting_price || 0 : 0);
      const minimumBid = Math.max(highestBid, startingPrice);

      if (parseFloat(amount) <= minimumBid) {
        return res.status(400).json({
          success: false,
          message: `Bid amount must be higher than current highest bid ($${minimumBid})`
        });
      }

      const newBid = db.create('bids', {
        auctionId: auction ? auction.id : null,
        productId,
        amount: parseFloat(amount),
        buyerId: buyerId || req.user?.id,
        status: 'active',
        bidTime: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      if (!newBid) {
        return res.status(500).json({
          success: false,
          message: 'Failed to place bid'
        });
      }

      if (auction) {
        const updatedAuction = db.update('auctions', auction.id, {
          currentPrice: parseFloat(amount),
          bidCount: (auction.bidCount || 0) + 1,
          updatedAt: new Date().toISOString()
        });
        
        if (!updatedAuction) {
          console.error('Failed to update auction after bid placement');
        }
      }

      res.status(201).json({
        success: true,
        message: 'Bid placed successfully',
        bid: newBid,
        auction: auction
      });
    } catch (error) {
      console.error('Place bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  updateBid(req, res) {
    try {
      const { id, buyerId } = req.params;
      const { amount } = req.body;

      const existingBid = db.getById('bids', id);
      if (!existingBid) {
        return res.status(404).json({
          success: false,
          message: 'Bid not found'
        });
      }

      if (existingBid.buyerId !== buyerId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own bids'
        });
      }

      const otherBids = db.getByQuery('bids', 
        existingBid.auctionId ? { auctionId: existingBid.auctionId } : { productId: existingBid.productId }
      ).filter(bid => bid.id !== id);

      const highestOtherBid = otherBids.length > 0 
        ? Math.max(...otherBids.map(bid => parseFloat(bid.amount)))
        : 0;

      if (parseFloat(amount) <= highestOtherBid) {
        return res.status(400).json({
          success: false,
          message: `Bid amount must be higher than current highest bid (${highestOtherBid})`
        });
      }

      const updatedBid = db.update('bids', id, {
        amount: parseFloat(amount),
        updatedAt: new Date().toISOString()
      });

      if (!updatedBid) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update bid'
        });
      }

      res.json({
        success: true,
        message: 'Bid updated successfully',
        bid: updatedBid
      });
    } catch (error) {
      console.error('Update bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  deleteBid(req, res) {
    try {
      const { id } = req.params;

      const bid = db.getById('bids', id);
      if (!bid) {
        return res.status(404).json({
          success: false,
          message: 'Bid not found'
        });
      }

      const deleted = db.delete('bids', id);

      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete bid'
        });
      }

      res.json({
        success: true,
        message: 'Bid deleted successfully'
      });
    } catch (error) {
      console.error('Delete bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getBidsByBuyer(req, res) {
    try {
      const { buyerId } = req.params;
      const bids = db.getByQuery('bids', { buyerId });

      res.json({
        success: true,
        bids,
        count: bids.length
      });
    } catch (error) {
      console.error('Get bids by buyer error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  getHighestBid(req, res) {
    try {
      const { auctionId } = req.params;
      const bids = db.getByQuery('bids', { auctionId });

      if (bids.length === 0) {
        return res.json({
          success: true,
          message: 'No bids found',
          highestBid: null,
          amount: 0
        });
      }

      const highestBid = bids.reduce((max, bid) => 
        parseFloat(bid.amount) > parseFloat(max.amount) ? bid : max
      );

      res.json({
        success: true,
        highestBid,
        amount: parseFloat(highestBid.amount)
      });
    } catch (error) {
      console.error('Get highest bid error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new BiddingController();
