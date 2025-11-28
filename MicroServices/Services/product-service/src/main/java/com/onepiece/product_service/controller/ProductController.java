package com.onepiece.product_service.controller;

import com.onepiece.product_service.dto.ProductRequestDTO;
import com.onepiece.product_service.dto.ProductResponseDTO;
import com.onepiece.product_service.model.Product;
import com.onepiece.product_service.model.ProductImage;
import com.onepiece.product_service.service.ProductImageService;
import com.onepiece.product_service.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/v1/product-service")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:8089"})
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductImageService productImageService;

    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(@RequestParam(required = false, defaultValue = "false") boolean includeAll) {
        try {
            List<ProductResponseDTO> products;
            if (includeAll) {
                products = productService.getAllProducts();
            } else {
                products = productService.getProductsByStatus(Product.ProductStatus.APPROVED);
            }
            return new ResponseEntity<>(products, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching products: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/products/add-product")
    @PreAuthorize("hasRole('ROLE_SELLER') and #productRequest.sellerId.toString() == authentication.name")
    public ResponseEntity<?> addProduct(
            @Valid @RequestPart ProductRequestDTO productRequest,
            @RequestPart(required = false) MultipartFile mainImage,
            @RequestPart(required = false) List<MultipartFile> additionalImages) {

        try {
            ProductResponseDTO savedProduct = productService.addProduct(productRequest, mainImage, additionalImages);
            return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>("Error processing images: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("Invalid input: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Internal server error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SELLER') or hasRole('ROLE_BUYER')")
    public ResponseEntity<?> getProductById(@PathVariable int productId) {
        try {
            ProductResponseDTO product = productService.getProductById(productId);
            return new ResponseEntity<>(product, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Product not found", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Internal server error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/products/category/{category}")
    public ResponseEntity<?> getProductsByCategory(
            @PathVariable Product.Category category,
            @RequestParam(required = false, defaultValue = "false") boolean includeAll) {
        try {
            List<ProductResponseDTO> products = productService.getProductsByCategory(category);
            if (!includeAll) {
                products = products.stream()
                        .filter(p -> "APPROVED".equals(p.getProductStatus()))
                        .toList();
            }
            return new ResponseEntity<>(products, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching products: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/products/seller/{sellerId}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or #sellerId.toString() == authentication.name")
    public ResponseEntity<?> getProductsBySeller(@PathVariable int sellerId) {
        try {
            List<ProductResponseDTO> products = productService.getProductsBySellerId(sellerId);
            return new ResponseEntity<>(products, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Seller not found", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching products: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/products/images/{productId}")
    public ResponseEntity<?> getProductImages(@PathVariable int productId) {
        try {
            List<ProductImage> images = productImageService.getImagesByProductId(productId);
            return new ResponseEntity<>(images, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching images: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/products/image/{imageId}")
    public ResponseEntity<?> getProductImageById(@PathVariable int imageId) {
        try {
            ProductImage image = productImageService.getImageById(imageId);
            if (image != null) {
                return new ResponseEntity<>(image, HttpStatus.OK);
            } else {
                return new ResponseEntity<>("Image not found", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching image: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/products/update/{productId}")
    @PreAuthorize("hasRole('ROLE_SELLER')")
    public ResponseEntity<?> updateProduct(
            @PathVariable int productId,
            @Valid @RequestPart ProductRequestDTO productRequest,
            @RequestPart(required = false) MultipartFile mainImage,
            @RequestPart(required = false) List<MultipartFile> additionalImages) {
        try {
            ProductResponseDTO updatedProduct = productService.updateProduct(productId, productRequest, mainImage, additionalImages);
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (IOException e) {
            return new ResponseEntity<>("Error processing images: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("Invalid input: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Product not found: " + e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Internal server error: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/products/delete/{productId}")
    @PreAuthorize("hasRole('ROLE_SELLER') or hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable int productId) {
        try {
            boolean deleted = productService.deleteProduct(productId);
            if (deleted) {
                return new ResponseEntity<>("Product deleted successfully", HttpStatus.OK);
            } else {
                return new ResponseEntity<>("Product not found", HttpStatus.NOT_FOUND);
            }
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Product not found", HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Error deleting product: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/admin/products/pending")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getPendingProducts() {
        try {
            List<ProductResponseDTO> products = productService.getPendingProducts();
            return new ResponseEntity<>(products, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching pending products: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/admin/products/approved")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> getApprovedProducts() {
        try {
            List<ProductResponseDTO> products = productService.getApprovedProduts();
            return new ResponseEntity<>(products, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Error fetching pending products: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/admin/products/{productId}/approve")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> approveProduct(@PathVariable int productId, @RequestParam int adminId) {
        try {
            ProductResponseDTO approvedProduct = productService.approveProduct(productId, adminId);
            return new ResponseEntity<>(approvedProduct, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Product not found: " + e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Error approving product: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/admin/products/{productId}/decline")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> declineProduct(@PathVariable int productId, @RequestParam int adminId) {
        try {
            ProductResponseDTO declinedProduct = productService.declineProduct(productId, adminId);
            return new ResponseEntity<>(declinedProduct, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Product not found: " + e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Error declining product: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/admin/products/{productId}/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateProductStatus(
            @PathVariable int productId,
            @RequestParam String status,
            @RequestParam int adminId) {
        try {
            Product.ProductStatus productStatus = Product.ProductStatus.valueOf(status.toUpperCase());
            ProductResponseDTO updatedProduct = productService.updateProductStatus(productId, productStatus, adminId);
            return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>("Invalid status: " + status, HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Product not found: " + e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>("Error updating product status: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


}
