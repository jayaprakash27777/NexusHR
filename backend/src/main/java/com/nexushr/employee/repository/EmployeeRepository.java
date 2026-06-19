package com.nexushr.employee.repository;

import com.nexushr.employee.model.Employee;
import com.nexushr.employee.model.EmployeeStatus;
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
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByEmployeeId(String employeeId);

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByUserId(UUID userId);

    boolean existsByEmail(String email);

    boolean existsByEmployeeId(String employeeId);

    List<Employee> findByDepartmentId(UUID departmentId);

    Page<Employee> findByDepartmentId(UUID departmentId, Pageable pageable);

    List<Employee> findByManagerId(UUID managerId);

    Page<Employee> findByManagerId(UUID managerId, Pageable pageable);

    Page<Employee> findByStatus(EmployeeStatus status, Pageable pageable);

    long countByStatus(EmployeeStatus status);

    long countByDepartmentId(UUID departmentId);

    @Query("SELECT e FROM Employee e WHERE " +
           "(LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.employeeId) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.designation) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Employee> search(@Param("query") String query, Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE " +
           "(:departmentId IS NULL OR e.department.id = :departmentId) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:query IS NULL OR " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.employeeId) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Employee> findWithFilters(
            @Param("query") String query,
            @Param("departmentId") UUID departmentId,
            @Param("status") EmployeeStatus status,
            Pageable pageable);

    @Query(value = "SELECT nextval('employee_id_seq')", nativeQuery = true)
    Long getNextEmployeeIdSequence();
}
