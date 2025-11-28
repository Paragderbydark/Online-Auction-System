package com.GSA.Backend.service;

import com.GSA.Backend.dto.BiddingRequestDTO;
import com.GSA.Backend.dto.BiddingResponseDTO;
import com.GSA.Backend.dto.PlaceBidRequestDTO;
import com.GSA.Backend.mapper.BiddingMapper;
import com.GSA.Backend.model.Auction;
import com.GSA.Backend.model.Bidding;
import com.GSA.Backend.model.Product;
import com.GSA.Backend.repo.AuctionRepo;
import com.GSA.Backend.repo.BiddingRepo;
import com.GSA.Backend.repo.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BiddingService {

    @Autowired
    private BiddingRepo biddingRepo;

    @Autowired
    private AuctionRepo auctionRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private BiddingMapper biddingMapper;

    public List<BiddingResponseDTO> getAllBids() {
        List<Bidding> bids = biddingRepo.findAll();
        return bids.stream()
                .map(bid -> biddingMapper.toResponseDTO(bid))
                .collect(Collectors.toList());
    }

    public BiddingResponseDTO addBidding(BiddingRequestDTO biddingDTO) throws IOException {
        Auction auction = auctionRepo.findById(biddingDTO.getAuctionId())
                .orElseThrow(() -> new RuntimeException("Auction not found with ID: " + biddingDTO.getAuctionId()));

        Product product = productRepo.findById(auction.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + auction.getProductId()));

        if (auction.getCurrStatus() != Auction.currStatus.ONGOING) {
            throw new IllegalArgumentException("Cannot place bid. Auction status is: " + auction.getCurrStatus());
        }

        Bidding bidding = biddingMapper.toEntity(biddingDTO);
        bidding.setCreatedAt(LocalDateTime.now());
        bidding.setUpdatedAt(LocalDateTime.now());
        bidding.setCreatedBy(biddingDTO.getBuyerId());
        bidding.setUpdatedBy(biddingDTO.getBuyerId());

        Bidding savedBidding = biddingRepo.save(bidding);
        return biddingMapper.toResponseDTO(savedBidding);
    }

    public BiddingResponseDTO getBidById(int bidId) {
        Bidding bidding = biddingRepo.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found with ID: " + bidId));
        return biddingMapper.toResponseDTO(bidding);
    }

    public void deleteBidById(int bidId) {
        if (!biddingRepo.existsById(bidId)) {
            throw new RuntimeException("Bid not found with ID: " + bidId);
        }
        biddingRepo.deleteById(bidId);
    }

    @Transactional(isolation = Isolation.SERIALIZABLE, rollbackFor = Exception.class)
    public BiddingResponseDTO placeBid(PlaceBidRequestDTO placeBidRequest) throws IOException {
        int maxRetries = 3;
        int retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                Auction auction = auctionRepo.findByIdWithLock(placeBidRequest.getAuctionId())
                        .orElseThrow(() -> new RuntimeException("Auction not found with ID: " + placeBidRequest.getAuctionId()));

                Product product = productRepo.findById(auction.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found with ID: " + auction.getProductId()));

                // Validate auction status
                if (auction.getCurrStatus() != Auction.currStatus.ONGOING) {
                    throw new IllegalArgumentException("Cannot place bid. Auction status is: " + auction.getCurrStatus());
                }

                // Validate bid amount
                int bidAmount = placeBidRequest.getBidAmount();
                int minimumBid = auction.getCurrPrice() + product.getPriceJump();

                if (bidAmount < minimumBid) {
                    throw new IllegalArgumentException(
                        "Bid amount must be at least " + minimumBid +
                        " (current price: " + auction.getCurrPrice() +
                        " + price jump: " + product.getPriceJump() + ")");
                }

                // Create new bidding record
                Bidding newBidding = new Bidding();
                newBidding.setAuctionId(placeBidRequest.getAuctionId());
                newBidding.setBuyerId(placeBidRequest.getBuyerId());
                newBidding.setNewBidAmount(bidAmount);
                newBidding.setBidTime(LocalDateTime.now());
                newBidding.setCreatedAt(LocalDateTime.now());
                newBidding.setUpdatedAt(LocalDateTime.now());
                newBidding.setCreatedBy(placeBidRequest.getBuyerId());
                newBidding.setUpdatedBy(placeBidRequest.getBuyerId());

                // Update auction with new price and bid count
                auction.setCurrPrice(bidAmount);
                auction.setBidCount(auction.getBidCount() + 1);
                auction.setUpdatedAt(LocalDateTime.now());
                auction.setUpdatedBy(placeBidRequest.getBuyerId());

                // Save both records
                Bidding savedBidding = biddingRepo.save(newBidding);
                auctionRepo.save(auction);

                return biddingMapper.toResponseDTO(savedBidding);

            } catch (OptimisticLockingFailureException e) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    throw new IOException("Failed to place bid after " + maxRetries +
                        " attempts. The auction is experiencing high bidding activity. Please try again.");
                }
                // Wait a bit before retrying
                try {
                    Thread.sleep(100 * retryCount); // Exponential backoff
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new IOException("Bid placement interrupted");
                }
            }
        }

        throw new IOException("Failed to place bid due to concurrent access");
    }

    public List<BiddingResponseDTO> getBidsByAuctionId(int auctionId) {
        List<Bidding> bids = biddingRepo.findByAuctionIdOrderByBidAmountDesc(auctionId);
        return bids.stream()
                .map(bid -> biddingMapper.toResponseDTO(bid))
                .collect(Collectors.toList());
    }

    public List<BiddingResponseDTO> getBidsByBuyerId(int buyerId) {
        List<Bidding> bids = biddingRepo.findByBuyerId(buyerId);
        return bids.stream()
                .map(bid -> biddingMapper.toResponseDTO(bid))
                .collect(Collectors.toList());
    }
}
