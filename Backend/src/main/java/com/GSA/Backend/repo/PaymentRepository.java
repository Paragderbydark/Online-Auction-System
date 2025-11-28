package com.GSA.Backend.repo;

import com.GSA.Backend.model.Payments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payments, Integer> {
    @Query("SELECT p FROM Payments p WHERE p.buyerId = :buyerId")
    List<Payments> findBuyerPayments(Integer buyerId);
    @Query("SELECT p FROM Payments p WHERE p.sellerId = :sellerId")
    List<Payments> findSellerPayments(Integer sellerId);

    @Query("SELECT p FROM Payments p WHERE p.sellerId = :sellerId AND p.createdBy = p.sellerId AND p.transactionStatus = :status")
    List<Payments> findSellerPaymentsByStatus(@Param("sellerId") Integer sellerId, @Param("status") String status);

    @Query("SELECT p FROM Payments p WHERE p.buyerId = :buyerId AND p.createdBy = p.buyerId AND p.transactionStatus = :status")
    List<Payments> findBuyerPaymentsByStatus(@Param("buyerId") Integer buyerId, @Param("status") String status);

    @Modifying
    @Transactional
    @Query("DELETE FROM Payments p WHERE p.buyerId = :buyerId")
    void deleteByBuyerId(@Param("buyerId") Integer buyerId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Payments p WHERE p.sellerId = :sellerId")
    void deleteBySellerId(@Param("sellerId") Integer sellerId);
}
