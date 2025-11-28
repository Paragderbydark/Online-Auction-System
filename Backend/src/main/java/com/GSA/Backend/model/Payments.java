package com.GSA.Backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Payments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Integer id;

    @Column(name = "buyer_id", nullable = false)
    private Integer buyerId;

    @Column(name = "seller_id", nullable = false)
    private Integer sellerId;

    @Column(name = "transaction_id", nullable = false)
    private String transactionId;

    @Column(name = "product_id", nullable = false)
    private Integer productId;

    @Column(name = "auction_id", nullable = false)
    private Integer auctionId;

    @Column(name = "final_amount", nullable = false)
    private Integer finalAmount;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "transaction_status")
    private String transactionStatus;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "payment_time")
    private LocalDateTime paymentTime;

    @Version
    @Column(name = "version")
    private Long version = 1L;

    @CreatedDate
    @Column(name = "created_at",updatable = false,insertable = false)
    private LocalDateTime createdAt;


    @LastModifiedDate
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private Integer createdBy;

    @LastModifiedBy
    @Column(name = "updated_by")
    private Integer updatedBy;
}
