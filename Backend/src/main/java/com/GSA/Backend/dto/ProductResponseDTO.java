package com.GSA.Backend.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDTO {
    private int productId;
    private int sellerId;
    private String productModel;
    private int modelYear;
    private int startPrice;
    private int priceJump;
    private String description;
    private LocalDate auctionDate;
    private LocalTime auctionStartTime;
    private int auctionDuration;
    private String category;
    private String productStatus;
    private String mainImageUrl;
    private List<String> additionalImageUrls;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}
