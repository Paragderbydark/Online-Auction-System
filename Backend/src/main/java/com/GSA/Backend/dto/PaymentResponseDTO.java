package com.GSA.Backend.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponseDTO {

    private Integer id;
    private Integer buyerId;
    private Integer sellerId;
    private String transactionId;
    private Integer productId;
    private Integer auctionId;
    private Integer finalAmount;
    private String paymentMethod;
    private String transactionStatus;
    private LocalDateTime paymentTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer createdBy;
    private Integer updatedBy;
}