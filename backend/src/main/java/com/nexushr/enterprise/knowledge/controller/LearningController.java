package com.nexushr.enterprise.knowledge.controller;

import com.nexushr.auth.model.User;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.enterprise.knowledge.dto.CourseDto;
import com.nexushr.enterprise.knowledge.dto.CourseEnrollmentDto;
import com.nexushr.enterprise.knowledge.service.LearningService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/knowledge/learning")
@RequiredArgsConstructor
@Tag(name = "Learning Center", description = "Learning and certification management")
public class LearningController {

    private final LearningService service;
    private final EmployeeRepository employeeRepository;

    @GetMapping("/catalog")
    @Operation(summary = "Get the course catalog")
    public ResponseEntity<ApiResponse<List<CourseDto>>> getCatalog() {
        return ResponseEntity.ok(ApiResponse.success(service.getCourseCatalog()));
    }

    @GetMapping("/my-learning")
    @Operation(summary = "Get enrollments for the current employee")
    public ResponseEntity<ApiResponse<List<CourseEnrollmentDto>>> getMyLearning(
            @AuthenticationPrincipal User user) {
        Employee employee = employeeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Employee not found for user"));
        return ResponseEntity.ok(ApiResponse.success(service.getEmployeeEnrollments(employee.getId())));
    }

    @PostMapping("/enrollments/{id}/launch")
    @Operation(summary = "Launch a course and update status")
    public ResponseEntity<ApiResponse<Void>> launchCourse(@PathVariable UUID id) {
        service.launchCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Course launched successfully"));
    }
}
