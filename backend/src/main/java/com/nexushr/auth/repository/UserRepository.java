package com.nexushr.auth.repository;

import com.nexushr.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    Optional<User> findByFirstNameAndLastName(String firstName, String lastName);

    boolean existsByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u JOIN u.userRoles ur WHERE ur.role.name = :roleName")
    java.util.List<User> findByRoleName(@org.springframework.data.repository.query.Param("roleName") String roleName);

    org.springframework.data.domain.Page<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email, org.springframework.data.domain.Pageable pageable);

    long countByActiveFalse();
}
