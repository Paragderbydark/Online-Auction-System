package com.onepiece.user_service.controller;


import com.onepiece.user_service.dto.AllUsersResponseDTO;
import com.onepiece.user_service.dto.AssignRoleRequest;
import com.onepiece.user_service.dto.UserProfileDTO;
import com.onepiece.user_service.dto.UserProfileUpdateDTO;
import com.onepiece.user_service.model.User;
import com.onepiece.user_service.model.UserRole;
import com.onepiece.user_service.service.UserRoleService;
import com.onepiece.user_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user-service")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRoleService userRoleService;

    @DeleteMapping("/admin/delete/{userId}")
     @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<String> deleteUser(@PathVariable int userId) {
        try {
            User user = userService.getUserById(userId);
            if (user != null) {
                userService.deleteUserById(userId);
                return new ResponseEntity<>("User deleted successfully", HttpStatus.OK);
            } else {
                return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to delete user: " + e.getMessage(), 
                                      HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

   
    @PostMapping("/assign-role")
     @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<String> assignRole(@Valid @RequestBody AssignRoleRequest request) {
        try {
            userRoleService.assignRoleToUser(request.getUserId(), request.getRoleId());
            return new ResponseEntity<>("Role assigned successfully", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to assign role: " + e.getMessage(), 
                                      HttpStatus.BAD_REQUEST);
        }
    }

   
    @PostMapping("/assign-seller-role/{userId}")
     @PreAuthorize("hasRole('ROLE_ADMIN') or #userId.toString() == authentication.name")
    public ResponseEntity<String> assignSellerRole(@PathVariable int userId) {
        try {
            userRoleService.assignSellerRole(userId);
            return ResponseEntity.ok("Seller role assigned successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                                .body("Failed to assign seller role: " + e.getMessage());
        }
    }

    
    @GetMapping("/roles/{userId}")
     @PreAuthorize("hasRole('ROLE_ADMIN') or #userId.toString() == authentication.name")
    public ResponseEntity<List<UserRole>> getUserRoles(@PathVariable int userId) {
        try {
            List<UserRole> userRoles = userRoleService.getUserRoles(userId);
            return ResponseEntity.ok(userRoles);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @Transactional
    @DeleteMapping("/admin/remove-role")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<String> removeRole(@Valid @RequestBody AssignRoleRequest request) {
        try {
            userRoleService.removeRoleFromUser(request.getUserId(), request.getRoleId());
            return ResponseEntity.ok("Role removed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                                .body("Failed to remove role: " + e.getMessage());
        }
    }

    @GetMapping("/check-role/{userId}/{roleId}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or #userId.toString() == authentication.name")
    public ResponseEntity<Boolean> checkUserRole(@PathVariable int userId, @PathVariable int roleId) {
        try {
            boolean hasRole = userRoleService.hasRole(userId, roleId);
            return ResponseEntity.ok(hasRole);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(false);
        }
    }


    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getUserProfile(@PathVariable int userId) {
        try {
            User user = userService.getUserById(userId);
            if (user != null) {
                UserProfileDTO profile = UserProfileDTO.builder()
                        .userId(user.getUserId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .contact(String.valueOf(user.getContact()))
                        .build();
                return ResponseEntity.ok(profile);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                                .body("Failed to get user profile: " + e.getMessage());
        }
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<String> updateUserProfile(@PathVariable int userId,
                                                   @Valid @RequestBody UserProfileUpdateDTO updateRequest) {
        try {
            User user = userService.getUserById(userId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            if (updateRequest.getFirstName() != null) {
                user.setFirstName(updateRequest.getFirstName());
            }
            if (updateRequest.getLastName() != null) {
                user.setLastName(updateRequest.getLastName());
            }
            if (updateRequest.getContact() != null) {
                user.setContact(Long.valueOf(updateRequest.getContact()));
            }
            if(updateRequest.getEmail() != null){
                user.setEmail(updateRequest.getEmail());
            }
            if (updateRequest.getUsername() != null){
                user.setUsername(updateRequest.getUsername());
            }

            userService.saveUser(user);
            return ResponseEntity.ok("Profile updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                                .body("Failed to update profile: " + e.getMessage());
        }
    }

    @GetMapping("/check-seller-role/{sellerId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Boolean> checkSellerRole(@PathVariable int sellerId){
        try {
            boolean isSeller = userRoleService.isSeller(sellerId);
            return ResponseEntity.ok(isSeller);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(false);
        }
    }


    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<AllUsersResponseDTO>> getAllUsers() {
        try {
            List<AllUsersResponseDTO> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
