package com.onepiece.paymentservice.service.impl;

import com.onepiece.paymentservice.dto.AdminPaymentResponseDTO;
import com.onepiece.paymentservice.dto.PaymentRequestDTO;
import com.onepiece.paymentservice.dto.PaymentResponseDTO;
import com.onepiece.paymentservice.dto.UserPaymentDTO;
import com.onepiece.paymentservice.model.Payments;
import com.onepiece.paymentservice.repository.PaymentRepository;
import com.onepiece.paymentservice.service.PaymentService;
import com.onepiece.paymentservice.service.UserClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    public final PaymentRepository paymentRepository;

    private final UserClientService userService;

    @Override
    public List<AdminPaymentResponseDTO> getAllPayments(){
        List<Payments> paymentsList = paymentRepository.findAll();
        return paymentsList.stream()
                .map(this::toAdminPaymentResponseDTO)
                .collect(Collectors.toList());
    }

    private AdminPaymentResponseDTO toAdminPaymentResponseDTO(Payments payment) {
        UserPaymentDTO buyer = null;
        UserPaymentDTO seller = null;
        if(payment.getBuyerId() != null){
            buyer = userService.getUserPaymentDTOById(payment.getBuyerId());
            seller = userService.getUserPaymentDTOById(payment.getSellerId());
        }
        return new AdminPaymentResponseDTO(
                payment.getId(),
                payment.getBuyerId(),
                payment.getSellerId(),
                payment.getTransactionId(),
                payment.getProductId(),
                payment.getAuctionId(),
                payment.getFinalAmount(),
                payment.getPaymentMethod(),
                payment.getTransactionStatus(),
                payment.getPaymentTime(),
                payment.getCreatedAt(),
                payment.getUpdatedAt(),
                payment.getCreatedBy(),
                payment.getUpdatedBy(),
                buyer,
                seller
        );
    }

    @Override
    public PaymentResponseDTO createPayment(PaymentRequestDTO paymentRequestDTO) {
        Payments paymentEntity = new Payments();
        paymentEntity.setBuyerId(paymentRequestDTO.getBuyerId());
        paymentEntity.setSellerId(paymentRequestDTO.getSellerId());
        paymentEntity.setTransactionId(paymentRequestDTO.getTransactionId());
        paymentEntity.setProductId(paymentRequestDTO.getProductId());
        paymentEntity.setAuctionId(paymentRequestDTO.getAuctionId());
        paymentEntity.setFinalAmount(paymentRequestDTO.getFinalAmount());
        paymentEntity.setPaymentMethod(paymentRequestDTO.getPaymentMethod());
        paymentEntity.setTransactionStatus(paymentRequestDTO.getTransactionStatus());
        paymentEntity.setPaymentTime(paymentRequestDTO.getPaymentTime());
        paymentEntity.setCreatedBy(paymentRequestDTO.getBuyerId());
        paymentEntity.setUpdatedBy(paymentRequestDTO.getBuyerId());
        Payments payObj = paymentRepository.save(paymentEntity);
        PaymentResponseDTO responseDTO = new PaymentResponseDTO(
                payObj.getId(),
                payObj.getBuyerId(),
                payObj.getSellerId(),
                payObj.getTransactionId(),
                payObj.getProductId(),
                payObj.getAuctionId(),
                payObj.getFinalAmount(),
                payObj.getPaymentMethod(),
                payObj.getTransactionStatus(),
                payObj.getPaymentTime(),
                payObj.getCreatedAt(),
                payObj.getUpdatedAt(),
                payObj.getCreatedBy(),
                payObj.getUpdatedBy()
        );
        return responseDTO;
    }

    @Override
    public PaymentResponseDTO updatePaymentStatus(Integer id, PaymentRequestDTO updatePaymentRequestDTO) {
        Optional<Payments> optionalPayments = paymentRepository.findById(id);
        if(optionalPayments.isEmpty()){
            throw new RuntimeException("Payment not found with id: " + id);
        }

        Payments existingPayments = optionalPayments.get();

        if (updatePaymentRequestDTO.getTransactionId() != null) {
            existingPayments.setTransactionId(updatePaymentRequestDTO.getTransactionId());
        }
        if (updatePaymentRequestDTO.getPaymentMethod() != null) {
            existingPayments.setPaymentMethod(updatePaymentRequestDTO.getPaymentMethod());
        }
        if (updatePaymentRequestDTO.getFinalAmount() != null) {
            existingPayments.setFinalAmount(updatePaymentRequestDTO.getFinalAmount());
        }
        if (updatePaymentRequestDTO.getTransactionStatus() != null) {
            existingPayments.setTransactionStatus(updatePaymentRequestDTO.getTransactionStatus());
        }
        if (updatePaymentRequestDTO.getPaymentTime() != null) {
            existingPayments.setPaymentTime(updatePaymentRequestDTO.getPaymentTime());
        }

        Payments savedPayments = paymentRepository.save(existingPayments);
        PaymentResponseDTO responseDTO = new PaymentResponseDTO(
                savedPayments.getId(),
                savedPayments.getBuyerId(),
                savedPayments.getSellerId(),
                savedPayments.getTransactionId(),
                savedPayments.getProductId(),
                savedPayments.getAuctionId(),
                savedPayments.getFinalAmount(),
                savedPayments.getPaymentMethod(),
                savedPayments.getTransactionStatus(),
                savedPayments.getPaymentTime(),
                savedPayments.getCreatedAt(),
                savedPayments.getUpdatedAt(),
                savedPayments.getCreatedBy(),
                savedPayments.getUpdatedBy()
        );
        return responseDTO;
    }

    @Override
    public List<PaymentResponseDTO> getBuyerPayments(Integer buyerId) {
        List<Payments> paymentsList = paymentRepository.findBuyerPayments(buyerId);
        List<PaymentResponseDTO> paymentDTOList = paymentsList.stream()
                .map(e-> new PaymentResponseDTO(e.getId(),
                        e.getBuyerId(), e.getSellerId(), e.getTransactionId(),
                        e.getProductId(), e.getAuctionId(), e.getFinalAmount(),
                        e.getPaymentMethod(), e.getTransactionStatus(), e.getPaymentTime(), e.getCreatedAt(), e.getUpdatedAt(),e.getCreatedBy(),e.getUpdatedBy()))
                .collect(Collectors.toList());
        return  paymentDTOList;
    }

    @Override
    public List<PaymentResponseDTO> getSellerPayments(Integer sellerId) {
        List<Payments> paymentsList = paymentRepository.findSellerPayments(sellerId);
        List<PaymentResponseDTO> paymentDTOList = paymentsList.stream()
                .map(e-> new PaymentResponseDTO(e.getId(),
                        e.getBuyerId(), e.getSellerId(), e.getTransactionId(),
                        e.getProductId(), e.getAuctionId(), e.getFinalAmount(),
                        e.getPaymentMethod(), e.getTransactionStatus(), e.getPaymentTime(),e.getCreatedAt(), e.getUpdatedAt(), e.getCreatedBy(),e.getUpdatedBy()))
                .collect(Collectors.toList());
        return  paymentDTOList;
    }

    @Override
    public List<PaymentResponseDTO> getSellerPaymentsByStatus(Integer sellerId, String status) {
        List<Payments> paymentsList = paymentRepository.findSellerPaymentsByStatus(sellerId, status);
        return paymentsList.stream()
                .map(e -> new PaymentResponseDTO(
                        e.getId(),
                        e.getBuyerId(),
                        e.getSellerId(),
                        e.getTransactionId(),
                        e.getProductId(),
                        e.getAuctionId(),
                        e.getFinalAmount(),
                        e.getPaymentMethod(),
                        e.getTransactionStatus(),
                        e.getPaymentTime(),
                        e.getCreatedAt(),
                        e.getUpdatedAt(),
                        e.getCreatedBy(),
                        e.getUpdatedBy()))
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponseDTO> getBuyerPaymentsByStatus(Integer buyerId, String status) {
        List<Payments> paymentsList = paymentRepository.findBuyerPaymentsByStatus(buyerId, status);
        return paymentsList.stream()
                .map(e -> new PaymentResponseDTO(
                        e.getId(),
                        e.getBuyerId(),
                        e.getSellerId(),
                        e.getTransactionId(),
                        e.getProductId(),
                        e.getAuctionId(),
                        e.getFinalAmount(),
                        e.getPaymentMethod(),
                        e.getTransactionStatus(),
                        e.getPaymentTime(),
                        e.getCreatedAt(),
                        e.getUpdatedAt(),
                        e.getCreatedBy(),
                        e.getUpdatedBy()))
                .collect(Collectors.toList());
    }

    @Override
    public PaymentResponseDTO getPaymentById(Integer paymentId) {
        Optional<Payments> optionalPayment = paymentRepository.findById(paymentId);
        if (optionalPayment.isPresent()) {
            Payments payObj = optionalPayment.get();
            return new PaymentResponseDTO(
                    payObj.getId(),
                    payObj.getBuyerId(),
                    payObj.getSellerId(),
                    payObj.getTransactionId(),
                    payObj.getProductId(),
                    payObj.getAuctionId(),
                    payObj.getFinalAmount(),
                    payObj.getPaymentMethod(),
                    payObj.getTransactionStatus(),
                    payObj.getPaymentTime(),
                    payObj.getCreatedAt(),
                    payObj.getUpdatedAt(),
                    payObj.getCreatedBy(),
                    payObj.getUpdatedBy()
            );
        } else {
            return null;
        }
    }

    @Override
    public void deletePaymentById(Integer paymentId) {
        paymentRepository.deleteById(paymentId);
    }

    @Override
    @Transactional
    public void deletePaymentsByBuyerId(Integer buyerId) {
        paymentRepository.deleteByBuyerId(buyerId);
    }

    @Override
    @Transactional
    public void deletePaymentsBySellerId(Integer sellerId) {
        paymentRepository.deleteBySellerId(sellerId);
    }

}