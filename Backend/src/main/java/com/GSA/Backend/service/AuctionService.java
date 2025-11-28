package com.GSA.Backend.service;

import com.GSA.Backend.dto.AuctionRequestDTO;
import com.GSA.Backend.dto.AuctionResponseDTO;
import com.GSA.Backend.mapper.AuctionMapper;
import com.GSA.Backend.model.Auction;
import com.GSA.Backend.model.Product;
import com.GSA.Backend.repo.AuctionRepo;
import com.GSA.Backend.repo.ProductRepo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuctionService {

    @Autowired
    private AuctionRepo auctionRepo;

    @Autowired
    private AuctionMapper auctionMapper;

    @Autowired
    private ProductRepo productRepo;


    public List<AuctionResponseDTO> getAllAuctions() {
        List<Auction> auctions = auctionRepo.findAll();
        return auctions.stream()
                .map(auction -> auctionMapper.toResponseDTO(auction))
                .collect(Collectors.toList());
    }

    public AuctionResponseDTO createAuction(@Valid AuctionRequestDTO auctionDTO) throws IOException {
        Auction auction = auctionMapper.toEntity(auctionDTO);

        auction.setCreatedAt(LocalDateTime.now());
        auction.setUpdatedAt(LocalDateTime.now());

        if (auction.getCurrStatus() == null) {
            auction.setCurrStatus(Auction.currStatus.SCHEDULED);
        }

        Product product = productRepo.findById(auctionDTO.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + auctionDTO.getProductId()));

        Integer sellerId = product.getSellerId();
        if (sellerId == null) {
            throw new RuntimeException("Product does not have a valid seller ID");
        }

        auction.setCreatedBy(sellerId);
        auction.setUpdatedBy(sellerId);

        Auction savedAuction = auctionRepo.save(auction);
        return auctionMapper.toResponseDTO(savedAuction);
    }

    public AuctionResponseDTO getAuctionById(int auctionId) {
        Auction auction = auctionRepo.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found with ID: " + auctionId));
        return auctionMapper.toResponseDTO(auction);
    }

    public AuctionResponseDTO updateAuctionById(int auctionId, AuctionRequestDTO auctionDTO) throws IOException{
        Auction existingAuction = auctionRepo.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found with ID: " + auctionId));

        if (auctionDTO.getCurrStatus() != null && !auctionDTO.getCurrStatus().isBlank()) {
            try {
                Auction.currStatus status = Auction.currStatus.valueOf(auctionDTO.getCurrStatus().toUpperCase());
                existingAuction.setCurrStatus(status);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status: " + auctionDTO.getCurrStatus());
            }
        }

        if(auctionDTO.getCurrPrice() != 0){
            existingAuction.setCurrPrice(auctionDTO.getCurrPrice());
        }
        if(auctionDTO.getBidCount() != 0){
            existingAuction.setBidCount(auctionDTO.getBidCount());
        }
        if(auctionDTO.getCurrStatus() != null && !auctionDTO.getCurrStatus().isBlank()){
            try {
                Auction.currStatus status = Auction.currStatus.valueOf(auctionDTO.getCurrStatus().toUpperCase());
                existingAuction.setCurrStatus(status);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status: " + auctionDTO.getCurrStatus());
            }
        }

        existingAuction.setUpdatedAt(LocalDateTime.now());

        Auction updatedAuction = auctionRepo.save(existingAuction);
        return auctionMapper.toResponseDTO(updatedAuction);
    }

    public void deleteAuction(int auctionId) {
        if (!auctionRepo.existsById(auctionId)) {
            throw new RuntimeException("Auction not found with ID: " + auctionId);
        }
        auctionRepo.deleteById(auctionId);
    }

    public List<AuctionResponseDTO> getAuctionsByProductId(int productId) {
        List<Auction> auctions = auctionRepo.findByProductId(productId);
        return auctions.stream()
                .map(auction -> auctionMapper.toResponseDTO(auction))
                .collect(Collectors.toList());
    }

    public List<AuctionResponseDTO> getAuctionsByStatus(String status) {
        try {
            Auction.currStatus statusEnum = Auction.currStatus.valueOf(status.toUpperCase());
            List<Auction> allAuctions = auctionRepo.findAll();

            return allAuctions.stream()
                    .filter(auction -> auction.getCurrStatus() == statusEnum)
                    .map(auction -> auctionMapper.toResponseDTO(auction))
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status +
                    ". Valid statuses are: SCHEDULED, ONGOING, COMPLETED");
        }
    }

    public List<AuctionResponseDTO> getAuctionsByUserId(int userId) {
        List<Product> userProducts = productRepo.getProductsBySellerId(userId);
        return userProducts.stream()
                .flatMap(product -> auctionRepo.findByProductId(product.getProductId()).stream()
                        .map(auction -> auctionMapper.toResponseDTO(auction)))
                .collect(Collectors.toList());
    }
}
