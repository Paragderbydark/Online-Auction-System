package com.onepiece.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserPaymentDTO {
    private int userId;
    private String firstName;
    private String lastName;
    private String email;
    private Long contact;
}
