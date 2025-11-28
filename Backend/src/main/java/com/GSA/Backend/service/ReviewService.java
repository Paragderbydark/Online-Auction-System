package com.GSA.Backend.service;

import com.GSA.Backend.dto.AdminReviewResponseDTO;
import com.GSA.Backend.dto.ReviewRequestDTO;
import com.GSA.Backend.dto.ReviewResponseDTO;

import java.util.List;

public interface ReviewService {

    ReviewResponseDTO createReview(ReviewRequestDTO reviewRequestDTO);

    List<ReviewResponseDTO> getMyBuyerReviews(Integer id);

    ReviewResponseDTO updateReview(Integer id, ReviewRequestDTO updateReviewRequestDTO);

    boolean deleteById(Integer id);

    List<ReviewResponseDTO> getMySellerReviews(Integer id);

    ReviewResponseDTO getReviewById(Integer id);

    List<AdminReviewResponseDTO> findAll();
}
