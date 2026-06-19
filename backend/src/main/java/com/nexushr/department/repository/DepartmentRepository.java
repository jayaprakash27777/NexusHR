package com.nexushr.department.repository;

import com.nexushr.department.model.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    Optional<Department> findByCode(String code);

    Optional<Department> findByName(String name);

    boolean existsByName(String name);

    boolean existsByCode(String code);

    List<Department> findByActiveTrue();

    Page<Department> findByActiveTrue(Pageable pageable);

    @Query("SELECT d FROM Department d WHERE " +
           "LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.code) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Department> search(@Param("query") String query, Pageable pageable);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.department.id = :deptId AND e.status = 'ACTIVE'")
    long countActiveEmployees(@Param("deptId") UUID departmentId);
}
