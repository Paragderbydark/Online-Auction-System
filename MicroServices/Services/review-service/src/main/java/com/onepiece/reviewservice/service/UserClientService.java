package com.onepiece.reviewservice.service;

import com.onepiece.reviewservice.dto.UserPaymentDTO;

public interface UserClientService {

    UserPaymentDTO getUserPaymentDTOById(int userId);
}
