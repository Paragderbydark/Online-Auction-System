package com.onepiece.paymentservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminPaymentResponseDTO {
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

    private UserPaymentDTO buyerInfo;
    private UserPaymentDTO sellerInfo;
}
