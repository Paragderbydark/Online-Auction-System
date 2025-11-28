package com.onepiece.paymentservice.service;

import com.onepiece.paymentservice.dto.UserPaymentDTO;

public interface UserClientService {


    UserPaymentDTO getUserPaymentDTOById(int userId);
}
