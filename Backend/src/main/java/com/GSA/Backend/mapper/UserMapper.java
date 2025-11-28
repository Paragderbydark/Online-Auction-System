package com.GSA.Backend.mapper;

import com.GSA.Backend.dto.RegisterRequestDTO;
import com.GSA.Backend.dto.RegisterResponseDTO;
import com.GSA.Backend.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class UserMapper {

    public User toEntity(RegisterRequestDTO dto) {
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        // user.setFirstName(dto.getFirstName());
        // user.setLastName(dto.getLastName());

        // if (dto.getContact() != null && !dto.getContact().isEmpty()) {
        //     user.setContact(Long.parseLong(dto.getContact()));
        // }

        user.setCreatedAt(LocalDate.now());
        user.setUpdatedAt(LocalDate.now());

        return user;
    }

    public RegisterResponseDTO toRegisterResponseDTO(User user, List<String> roles) {
        return RegisterResponseDTO.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .roles(roles)
                .message("User registered successfully")
                .build();
    }
}

