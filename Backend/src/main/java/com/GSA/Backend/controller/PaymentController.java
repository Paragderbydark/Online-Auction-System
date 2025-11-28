package com.GSA.Backend.controller;


import com.GSA.Backend.dto.AdminPaymentResponseDTO;
import com.GSA.Backend.dto.PaymentRequestDTO;
import com.GSA.Backend.dto.PaymentResponseDTO;
import com.GSA.Backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<AdminPaymentResponseDTO>> getAllPayments() {
        List<AdminPaymentResponseDTO> paymentDTOS = paymentService.getAllPayments();
        return new ResponseEntity<>(paymentDTOS, HttpStatus.OK);
    }

    @PostMapping("/create-payment")
    public ResponseEntity<PaymentResponseDTO> createPayment(@Valid @RequestBody PaymentRequestDTO paymentRequestDTO) {
        log.info("Received payment request for auction ID: {}", paymentRequestDTO.getAuctionId());
        PaymentResponseDTO responseDTO = paymentService.createPayment(paymentRequestDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> updatePaymentStatus(
            @PathVariable Integer id,
            @Valid @RequestBody PaymentRequestDTO updatePaymentRequestDTO) {
        PaymentResponseDTO responseDTO = paymentService.updatePaymentStatus(id, updatePaymentRequestDTO);
        log.info("Updated payment: {}", responseDTO);
        return new ResponseEntity<>(responseDTO, HttpStatus.OK);
    }

    @GetMapping("/seller/{id}")
    @PreAuthorize("@userService.getUserById(#id).username == authentication.name")
    public ResponseEntity<List<PaymentResponseDTO>> getBySellerId(@PathVariable Integer id) {
        List<PaymentResponseDTO> paymentDTOS = paymentService.getSellerPayments(id);
        return new ResponseEntity<>(paymentDTOS, HttpStatus.OK);
    }

    @GetMapping("/buyer/{id}")
    @PreAuthorize("@userService.getUserById(#id).username == authentication.name")
    public ResponseEntity<List<PaymentResponseDTO>> getByBuyerId(@PathVariable Integer id) {
        List<PaymentResponseDTO> paymentDTOS = paymentService.getBuyerPayments(id);
        return new ResponseEntity<>(paymentDTOS, HttpStatus.OK);
    }

    @GetMapping("/seller/{id}/{status}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsBySellerStatus(
            @PathVariable Integer id,
            @PathVariable String status) {
        List<PaymentResponseDTO> paymentDTOS = paymentService.getSellerPaymentsByStatus(id, status);
        return new ResponseEntity<>(paymentDTOS, HttpStatus.OK);
    }

    @GetMapping("/buyer/{id}/{status}")
    public ResponseEntity<List<PaymentResponseDTO>> getPaymentsByBuyerStatus(
            @PathVariable Integer id,
            @PathVariable String status) {
        List<PaymentResponseDTO> paymentDTOS = paymentService.getBuyerPaymentsByStatus(id, status);
        return new ResponseEntity<>(paymentDTOS, HttpStatus.OK);
    }

    @GetMapping("/payment/{paymentId}")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(@PathVariable Integer paymentId) {
        PaymentResponseDTO payment = paymentService.getPaymentById(paymentId);
        if(payment != null) {
            return new ResponseEntity<>(payment, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/delete/{paymentId}")
    public ResponseEntity<String> deletePayment(@PathVariable Integer paymentId) {
        PaymentResponseDTO payment = paymentService.getPaymentById(paymentId);
        if(payment != null) {
            paymentService.deletePaymentById(paymentId);
            return new ResponseEntity<>("Payment deleted successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Payment not found", HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/delete/buyer/{buyerId}")
    public ResponseEntity<String> deletePaymentsByBuyerId(@PathVariable Integer buyerId) {
        paymentService.deletePaymentsByBuyerId(buyerId);
        return new ResponseEntity<>("Payments for buyer deleted successfully", HttpStatus.OK);
    }

    @DeleteMapping("/delete/seller/{sellerId}")
    public ResponseEntity<String> deletePaymentsBySellerId(@PathVariable Integer sellerId) {
        paymentService.deletePaymentsBySellerId(sellerId);
        return new ResponseEntity<>("Payments for seller deleted successfully", HttpStatus.OK);
    }
}