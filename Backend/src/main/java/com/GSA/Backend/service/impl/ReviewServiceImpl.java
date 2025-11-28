package com.GSA.Backend.service.impl;


import com.GSA.Backend.dto.AdminReviewResponseDTO;
import com.GSA.Backend.dto.ReviewRequestDTO;
import com.GSA.Backend.dto.ReviewResponseDTO;
import com.GSA.Backend.dto.UserPaymentDTO;
import com.GSA.Backend.model.Review;
import com.GSA.Backend.repo.ReviewRepository;
import com.GSA.Backend.service.ReviewService;
import com.GSA.Backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    public final ReviewRepository reviewRepository;

    @Autowired
    private UserService userService;

    @Override
    public List<AdminReviewResponseDTO> findAll() {
        List<Review> reviews = reviewRepository.findAll();
        return reviews.stream()
                .map(this::toAdminReviewResponseDTO)
                .collect(Collectors.toList());
    }

    private AdminReviewResponseDTO toAdminReviewResponseDTO(Review review) {
        UserPaymentDTO buyer = null;
        UserPaymentDTO seller = null;

        if(review.getBuyerId() != null) {
            buyer = userService.getUserPaymentDTOById(review.getBuyerId());
            seller = userService.getUserPaymentDTOById(review.getSellerId());
        }
        return new AdminReviewResponseDTO(
                review.getId(),
                review.getBuyerId(),
                review.getSellerId(),
                review.getAuctionId(),
                review.getReview(),
                review.getRating(),
                review.getVersion(),
                review.getCreatedAt(),
                review.getUpdatedAt(),
                review.getCreatedBy(),
                review.getUpdatedBy(),
                buyer,
                seller
        );
    }

    @Override
    public ReviewResponseDTO createReview(ReviewRequestDTO reviewRequestDTO) {
        Review revEntity =new Review(
                reviewRequestDTO.getBuyerId(),
                reviewRequestDTO.getSellerId(),
                reviewRequestDTO.getAuctionId(),
                reviewRequestDTO.getReview(),
                reviewRequestDTO.getRating()
        );

        revEntity.setCreatedBy(reviewRequestDTO.getBuyerId());
        revEntity.setUpdatedBy(reviewRequestDTO.getBuyerId());

        Review revObj = reviewRepository.save(revEntity);
        log.info("rev obj with id # {}", revObj.getId());

        ReviewResponseDTO responseDTO = new ReviewResponseDTO(
                revObj.getId(),
                revObj.getBuyerId(),
                revObj.getSellerId(),
                revObj.getAuctionId(),
                revObj.getReview(),
                revObj.getRating(),
                revObj.getVersion(),
                revObj.getCreatedAt(),
                revObj.getUpdatedAt(),
                revObj.getCreatedBy(),
                revObj.getUpdatedBy()
        );
        return responseDTO;
    }

    public List<ReviewResponseDTO> getMyBuyerReviews(Integer buyerId) {
        List<Review> reviews = reviewRepository.findBuyerReviewsForSeller(buyerId);
        List<ReviewResponseDTO> reviewDTO =reviews.stream()
                .map(e-> new ReviewResponseDTO(e.getId(),
                        e.getBuyerId(), e.getSellerId(),
                        e.getAuctionId(), e.getReview(), e.getRating(),
                        e.getCreatedAt(), e.getUpdatedAt()))
                        .collect(Collectors.toList());

        return reviewDTO;
    }

    @Override
    public List<ReviewResponseDTO> getMySellerReviews(Integer sellerId) {
        List<Review> reviews = reviewRepository.findSellerReviewsForBuyer(sellerId);
        List<ReviewResponseDTO> reviewDTO =reviews.stream()
                .map(e-> new ReviewResponseDTO(e.getId(),
                        e.getBuyerId(), e.getSellerId(),
                        e.getAuctionId(), e.getReview(), e.getRating(),
                        e.getCreatedAt(), e.getUpdatedAt()))
                .collect(Collectors.toList());

        return reviewDTO;
    }

    @Override
    public ReviewResponseDTO getReviewById(Integer id) {
        Optional<Review> optionalReview = reviewRepository.findById(id);
        if(optionalReview.isPresent()){
            return new ReviewResponseDTO(
                    optionalReview.get().getId(),
                    optionalReview.get().getBuyerId(),
                    optionalReview.get().getSellerId(),
                    optionalReview.get().getAuctionId(),
                    optionalReview.get().getReview(),
                    optionalReview.get().getRating(),
                    optionalReview.get().getCreatedAt(),
                    optionalReview.get().getUpdatedAt()
                    );
        }
        return null;
    }

    @Override
    public ReviewResponseDTO updateReview(Integer id, ReviewRequestDTO updateReviewRequestDTO) {
        Optional<Review> optionalReview = reviewRepository.findById(id);
        if (optionalReview.isEmpty()) {
            throw new RuntimeException("Review not found with id: " + id);
        }

        Review existingReview = optionalReview.get();

        // Update only provided fields
        if (updateReviewRequestDTO.getReview() != null) {
            existingReview.setReview(updateReviewRequestDTO.getReview());
        }
        if (updateReviewRequestDTO.getRating() != null) {
            existingReview.setRating(updateReviewRequestDTO.getRating());
        }

        // Ensure updatedBy is never null: prefer request value, otherwise keep existing value
        Integer updater = updateReviewRequestDTO.getBuyerId() != null
                ? updateReviewRequestDTO.getBuyerId()
                : existingReview.getUpdatedBy();
        existingReview.setUpdatedBy(updater);

        Review savedReview = reviewRepository.save(existingReview);

        return new ReviewResponseDTO(
                savedReview.getId(),
                savedReview.getBuyerId(),
                savedReview.getSellerId(),
                savedReview.getAuctionId(),
                savedReview.getReview(),
                savedReview.getRating(),
                savedReview.getCreatedAt(),
                savedReview.getUpdatedAt()
        );
    }

    @Override
    public boolean deleteById(Integer id) {
        Optional<Review> optionalReview = reviewRepository.findById(id);
        if (optionalReview.isEmpty()) {
            throw new RuntimeException("Review not found with id: " + id);
        }
        reviewRepository.deleteById(id);
        return true;
    }
}
