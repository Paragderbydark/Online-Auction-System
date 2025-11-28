package com.GSA.Backend.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating user profile information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateDTO {
    
    @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
    private String firstName;
    
    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    private String lastName;
    
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
    private String contact;

    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$",
            message = "Invalid email format")
    private String email;

    @Size(min = 1, max = 10, message = "Username must be unique")
    private String username;
}
