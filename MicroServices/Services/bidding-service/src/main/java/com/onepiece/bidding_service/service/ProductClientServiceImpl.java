package com.onepiece.bidding_service.service;

import com.onepiece.bidding_service.dto.ProductResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class ProductClientServiceImpl implements ProductClientService {

    private final RestTemplate restTemplate;

    private static final String PRODUCT_SERVICE_URL = "http://product-service/api/v1/product-service";

    @Autowired
    public ProductClientServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public ProductResponseDTO getProductById(int productId) {
        String url = PRODUCT_SERVICE_URL + "/product/" + productId;

        return restTemplate.getForObject(url, ProductResponseDTO.class);
    }

    @Override
    public List<ProductResponseDTO> getProductsBySeller(int sellerId) {
        String url = PRODUCT_SERVICE_URL + "/products/seller/" + sellerId;

        ResponseEntity<List<ProductResponseDTO>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<List<ProductResponseDTO>>() {}
        );

        return response.getBody();
    }
}