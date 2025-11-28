package com.GSA.Backend.service;

import com.GSA.Backend.dto.*;
import com.GSA.Backend.model.Payments;
import com.GSA.Backend.model.User;
import com.GSA.Backend.model.UserPrincipal;
import com.GSA.Backend.model.UserRole;
import com.GSA.Backend.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private UserRoleService userRoleService;

    private final PaymentService paymentService;

    @Autowired
    private AuctionService auctionService;

    @Autowired
    private BiddingService biddingService;

    @Autowired
    private ProductService productRepo;

    public UserService(@Lazy PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = userRepo.findByUsername(username);

        if(user == null){
            System.out.println("user 404 error");
            throw new UsernameNotFoundException("user 404");
        }

        List<UserRole> userRoles = userRoleService.getUserRoles(user.getUserId());
        List<String> roles = userRoles.stream()
                .map(ur -> getRoleName(ur.getRoleId()))
                .collect(java.util.stream.Collectors.toList());

        return new UserPrincipal(user, roles);
    }

    private String getRoleName(int roleId) {
        switch(roleId) {
            case 1: return "BUYER";
            case 2: return "SELLER";
            case 3: return "ADMIN";
            default: return "USER";
        }
    }

    public List<UserRole> getUserRoles(int userId){
        return userRoleService.getUserRoles(userId);
    }

    public UserRole assignRoleToUser(int userId,int roleId){
        return userRoleService.assignRoleToUser(userId,roleId);
    }

    public User getUserById(int userId) {
        return userRepo.findById(userId).orElse(null);
    }

    public User getUserByUsername(String username) {
        return userRepo.findByUsername(username);
    }

    @Transactional
    public void deleteUserById(int userId) {
        // Delete payments where user is buyer
        paymentService.deletePaymentsByBuyerId(userId);
        paymentService.deletePaymentsBySellerId(userId);
        // Delete bids placed by user (as buyer)
        List<BiddingResponseDTO> userBids = biddingService.getBidsByBuyerId(userId);
        if (userBids != null) {
            for (BiddingResponseDTO bid : userBids) {
                biddingService.deleteBidById(bid.getBidId());
            }
        }

        // Delete products sold by user and their related auctions & bids
        List<ProductResponseDTO> products = productRepo.getProductsBySellerId(userId);
        if (products != null) {
            for (ProductResponseDTO product : products) {
                List<AuctionResponseDTO> auctions = auctionService.getAuctionsByProductId(product.getProductId());
                if (auctions != null) {
                    for (AuctionResponseDTO auction : auctions) {
                        List<BiddingResponseDTO> auctionBids = biddingService.getBidsByAuctionId(auction.getAuctionId());
                        if (auctionBids != null) {
                            for (BiddingResponseDTO ab : auctionBids) {
                                biddingService.deleteBidById(ab.getBidId());
                            }
                        }
                        auctionService.deleteAuction(auction.getAuctionId());
                    }
                }
                productRepo.deleteProduct(product.getProductId());
            }
        }

        // Remove all roles for the user
        List<UserRole> roles = userRoleService.getUserRoles(userId);
        if (roles != null) {
            for (UserRole role : roles) {
                userRoleService.removeRoleFromUser(userId, role.getRoleId());
            }
        }

        // Finally delete the user
        userRepo.deleteById(userId);
    }


    public User saveUser(User user) {
        return userRepo.save(user);
    }


    public List<AllUsersResponseDTO> getAllUsers() {
        List<User> users = userRepo.findAll();
        return users.stream().map(user -> {
            List<UserRole> roles = userRoleService.getUserRoles(user.getUserId());
            String roleNames = roles.stream()
                    .map(role -> getRoleName(role.getRoleId()))
                    .collect(Collectors.joining(", "));
            return new AllUsersResponseDTO(
                    user.getUserId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getContact(),
                    roleNames,
                    user.getCreatedAt()
            );
        }).collect(Collectors.toList());

    }


    public User getUserByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    public boolean existsByUsername(String username) {
        return userRepo.findByUsername(username) != null;
    }


    public boolean existsByEmail(String email) {
        return userRepo.findByEmail(email) != null;
    }

    public UserPaymentDTO getUserPaymentDTOById(Integer userId) {
        if (userId == null) return null;
        return userRepo.findById(userId)
                .map(u -> new UserPaymentDTO(
                        u.getUserId(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getEmail(),
                        u.getContact()
                ))
                .orElse(null);
    }
}
