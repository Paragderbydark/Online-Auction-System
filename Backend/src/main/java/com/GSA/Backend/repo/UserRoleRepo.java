package com.GSA.Backend.repo;

import com.GSA.Backend.model.UserRole;
import com.GSA.Backend.model.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRoleRepo extends JpaRepository<UserRole, Integer> {
    List<UserRole> findByUserId(int userId);
    List<UserRole> findByRoleId(int roleId);
    boolean existsByUserIdAndRoleId(int userId, int roleId);
    void deleteByUserIdAndRoleId(int userId, int roleId);
}
