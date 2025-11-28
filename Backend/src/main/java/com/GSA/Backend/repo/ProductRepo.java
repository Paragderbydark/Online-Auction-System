package com.GSA.Backend.repo;

import com.GSA.Backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepo extends JpaRepository<Product, Integer> {

    @Query("SELECT p FROM Product p WHERE p.category = :category")
    List<Product> getProductsByCategory(@Param("category") Product.Category category);

    @Query("SELECT s FROM Product s WHERE s.sellerId = :sellerId")
    List<Product> getProductsBySellerId(@Param("sellerId") int sellerId);

    @Query("SELECT p FROM Product p WHERE p.productStatus = :status")
    List<Product> getProductsByStatus(@Param("status") Product.ProductStatus status);

    @Query("SELECT p FROM Product p WHERE p.productStatus = com.GSA.Backend.model.Product$ProductStatus.PENDING")
    List<Product> getPendingProducts();

    @Query("SELECT p FROM Product p WHERE p.productStatus = com.GSA.Backend.model.Product$ProductStatus.APPROVED")
    List<Product> getApprovedProducts();
}
