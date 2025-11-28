package com.GSA.Backend.controller;

import com.GSA.Backend.dto.ProductRequestDTO;
import com.GSA.Backend.dto.ProductResponseDTO;
import com.GSA.Backend.service.ProductService;
import com.GSA.Backend.service.ProductImageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
public class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;
    
    @MockBean
    private ProductImageService productImageService;

    private ObjectMapper objectMapper;
    private ProductRequestDTO productRequestDTO;
    private ProductResponseDTO productResponseDTO;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        productRequestDTO = new ProductRequestDTO();
        productRequestDTO.setSellerId(1);
        productRequestDTO.setProductModel("Test Car");
        productRequestDTO.setModelYear(2020);
        productRequestDTO.setStartPrice(50000);
        productRequestDTO.setDescription("Test Description");
        productRequestDTO.setAuctionDate(LocalDate.now().plusDays(7));
        productRequestDTO.setAuctionStartTime(LocalTime.of(10, 0));
        productRequestDTO.setAuctionDuration(60);
        productRequestDTO.setCategory("Luxury");

        productResponseDTO = ProductResponseDTO.builder()
                .productId(1)
                .sellerId(1)
                .productModel("Test Car")
                .modelYear(2020)
                .startPrice(50000)
                .description("Test Description")
                .auctionDate(LocalDate.now().plusDays(7))
                .auctionStartTime(LocalTime.of(10, 0))
                .auctionDuration(60)
                .category("Luxury")
                .build();
    }

    @Test
    void testAddProduct() throws Exception {
        // Prepare mock files
        MockMultipartFile mainImage = new MockMultipartFile(
                "mainImage", "main.jpg", "image/jpeg", "main image content".getBytes());
        
        MockMultipartFile additionalImage1 = new MockMultipartFile(
                "additionalImages", "additional1.jpg", "image/jpeg", "additional image 1".getBytes());
        
        MockMultipartFile productJson = new MockMultipartFile(
                "productRequest", "", "application/json", objectMapper.writeValueAsBytes(productRequestDTO));

        when(productService.addProduct(any(ProductRequestDTO.class), any(), anyList()))
                .thenReturn(productResponseDTO);

        mockMvc.perform(multipart("/api/v1/products/add-product")
                        .file(productJson)
                        .file(mainImage)
                        .file(additionalImage1)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated());
    }
}
