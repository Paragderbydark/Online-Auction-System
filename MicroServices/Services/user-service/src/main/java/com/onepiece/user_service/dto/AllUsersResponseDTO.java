package com.onepiece.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AllUsersResponseDTO {
    private int userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Long contact;
    private String role;
    private LocalDate createdAt;
}
