package com.GSA.Backend.mapper;

import com.GSA.Backend.dto.AuctionRequestDTO;
import com.GSA.Backend.dto.AuctionResponseDTO;
import com.GSA.Backend.model.Auction;
import com.GSA.Backend.model.Product;
import org.springframework.stereotype.Component;

@Component
public class AuctionMapper {

    public Auction toEntity(AuctionRequestDTO dto) {
        Auction auction = new Auction();
        auction.setProductId(dto.getProductId());
        auction.setCurrPrice(dto.getCurrPrice());
        auction.setBidCount(dto.getBidCount());
        if (dto.getCurrStatus() != null && !dto.getCurrStatus().isBlank()) {
            try {
                Auction.currStatus status = Auction.currStatus.valueOf(dto.getCurrStatus().toUpperCase());
                auction.setCurrStatus(status);
            } catch (IllegalArgumentException e) {
                // leave null or handle upstream; don't throw here to keep mapper simple
                auction.setCurrStatus(null);
            }
        }
        return auction;
    }

    public AuctionResponseDTO toResponseDTO(Auction auction) {

        return AuctionResponseDTO.builder()
                .auctionId(auction.getAuctionId())
                .productId(auction.getProductId())
                .currPrice(auction.getCurrPrice())
                .currStatus(auction.getCurrStatus() != null ? auction.getCurrStatus().name() : null)
                .bidCount(auction.getBidCount())
                .createdAt(auction.getCreatedAt() != null ? auction.getCreatedAt().toLocalDate() : null)
                .updatedAt(auction.getUpdatedAt() != null ? auction.getUpdatedAt().toLocalDate() : null)
                .build();
    }

    public AuctionResponseDTO toResponseDTO(Auction auction, Product product) {
        return toResponseDTO(auction);
    }
}
