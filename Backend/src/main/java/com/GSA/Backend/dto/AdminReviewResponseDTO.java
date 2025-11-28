package com.GSA.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminReviewResponseDTO {
    private Integer id;
    private Integer buyerId;
    private Integer sellerId;
    private Integer auctionId;
    private String review;
    private Float rating;
    private Long version;
    private Instant createdAt;
    private Instant updatedAt;
    private Integer createdBy;
    private Integer updatedBy;

    private UserPaymentDTO buyerInfo;
    private UserPaymentDTO sellerInfo;
}
