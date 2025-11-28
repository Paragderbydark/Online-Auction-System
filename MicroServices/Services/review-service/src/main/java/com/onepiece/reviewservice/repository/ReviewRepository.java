package com.onepiece.reviewservice.repository;

import com.onepiece.reviewservice.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review,Integer> {
    @Query("SELECT r FROM Review r WHERE r.buyerId = :buyerId")
    List<Review> findBuyerReviewsForSeller(@Param("buyerId") Integer buyerId);

    @Query("SELECT r FROM Review r WHERE r.sellerId=:sellerId")
    List<Review> findSellerReviewsForBuyer(@Param("sellerId") Integer sellerId);
}
