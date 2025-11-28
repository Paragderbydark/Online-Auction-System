package com.onepiece.bidding_service.service;


import com.onepiece.bidding_service.dto.ProductResponseDTO;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;


public interface ProductClientService {

    ProductResponseDTO getProductById(@PathVariable int productId);

    List<ProductResponseDTO> getProductsBySeller(@PathVariable int sellerId);

}
