package com.GSA.Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user profile information (safe for client consumption)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileDTO {
    
    private int userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String contact;
}
