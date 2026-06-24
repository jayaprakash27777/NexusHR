package com.nexushr.enterprise.knowledge.repository;

import com.nexushr.enterprise.knowledge.entity.CourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, UUID> {
    List<CourseEnrollment> findByEmployeeId(UUID employeeId);
    
    @Query("SELECT e FROM CourseEnrollment e JOIN FETCH e.course WHERE e.employee.id = :employeeId")
    List<CourseEnrollment> findByEmployeeIdWithCourse(@Param("employeeId") UUID employeeId);
}
