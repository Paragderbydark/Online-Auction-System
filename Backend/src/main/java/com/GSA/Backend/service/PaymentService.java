package com.GSA.Backend.service;


import com.GSA.Backend.dto.AdminPaymentResponseDTO;
import com.GSA.Backend.dto.PaymentRequestDTO;
import com.GSA.Backend.dto.PaymentResponseDTO;
import jakarta.validation.Valid;

import java.util.List;

public interface PaymentService {
    PaymentResponseDTO createPayment(@Valid PaymentRequestDTO paymentRequestDTO);

    PaymentResponseDTO updatePaymentStatus(Integer id, PaymentRequestDTO updatePaymentRequestDTO);

    List<PaymentResponseDTO> getBuyerPayments(Integer id);

    List<PaymentResponseDTO> getSellerPayments(Integer id);

    List<PaymentResponseDTO> getSellerPaymentsByStatus(Integer id, String status);

    List<PaymentResponseDTO> getBuyerPaymentsByStatus(Integer id, String status);

    PaymentResponseDTO getPaymentById(Integer paymentId);

    void deletePaymentById(Integer paymentId);

    void deletePaymentsByBuyerId(Integer buyerId);

    void deletePaymentsBySellerId(Integer sellerId);

    List<AdminPaymentResponseDTO> getAllPayments();
}
