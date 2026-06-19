package com.nexushr.employee.controller;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.employee.dto.*;
import com.nexushr.employee.model.EmployeeStatus;
import com.nexushr.employee.service.EmployeeService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.nexushr.common.export.ExcelExportService;

import java.util.UUID;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Employee lifecycle management endpoints")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final ExcelExportService excelExportService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create employee", description = "Creates a new employee record (Admin only)")
    public ResponseEntity<ApiResponse<EmployeeResponse>> create(
            @Valid @RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update employee", description = "Updates an existing employee (Admin/Manager)")
    public ResponseEntity<ApiResponse<EmployeeResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEmployeeRequest request) {
        return ResponseEntity.ok(employeeService.update(id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by UUID")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.getById(id));
    }

    @GetMapping("/eid/{employeeId}")
    @Operation(summary = "Get employee by Employee ID", description = "Lookup by employee code like NHR-1001")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getByEmployeeId(@PathVariable String employeeId) {
        return ResponseEntity.ok(employeeService.getByEmployeeId(employeeId));
    }

    @GetMapping
    @Operation(summary = "Get all employees with pagination")
    public ResponseEntity<PagedResponse<EmployeeResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        return ResponseEntity.ok(employeeService.getAll(page, size, sortBy, direction));
    }

    @GetMapping("/search")
    @Operation(summary = "Search employees", description = "Search by name, email, ID, or designation")
    public ResponseEntity<PagedResponse<EmployeeResponse>> search(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(employeeService.search(query, page, size));
    }

    @GetMapping("/department/{departmentId}")
    @Operation(summary = "Get employees by department")
    public ResponseEntity<PagedResponse<EmployeeResponse>> getByDepartment(
            @PathVariable UUID departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(employeeService.getByDepartment(departmentId, page, size));
    }

    @GetMapping("/manager/{managerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get employees by manager", description = "Get direct reports of a manager")
    public ResponseEntity<PagedResponse<EmployeeResponse>> getByManager(
            @PathVariable UUID managerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(employeeService.getByManager(managerId, page, size));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get employees by status")
    public ResponseEntity<PagedResponse<EmployeeResponse>> getByStatus(
            @PathVariable EmployeeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(employeeService.getByStatus(status, page, size));
    }

    @GetMapping("/filter")
    @Operation(summary = "Filter employees", description = "Filter by query, department, and status")
    public ResponseEntity<PagedResponse<EmployeeResponse>> filter(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) EmployeeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(employeeService.filter(query, departmentId, status, page, size));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Terminate employee", description = "Soft deletes by setting status to TERMINATED (Admin only)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.delete(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update employee status", description = "Change employee status (Admin only)")
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateStatus(
            @PathVariable UUID id,
            @RequestParam EmployeeStatus status) {
        return ResponseEntity.ok(employeeService.updateStatus(id, status));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Export employees to Excel")
    public ResponseEntity<byte[]> exportEmployees() {
        try {
            List<EmployeeResponse> employees = employeeService.getAll(0, 10000, "lastName", "asc").getContent();
            List<Map<String, Object>> data = employees.stream().map(emp -> {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("ID", emp.getEmployeeId());
                map.put("Name", emp.getFirstName() + " " + emp.getLastName());
                map.put("Email", emp.getEmail());
                map.put("Department", emp.getDepartmentName());
                map.put("Designation", emp.getDesignation());
                map.put("Status", emp.getStatus());
                return map;
            }).collect(Collectors.toList());

            byte[] excelBytes = excelExportService.exportToExcel(data, "Employees");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "employees.xlsx");
            return ResponseEntity.ok().headers(headers).body(excelBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Phase 2: Deep Profile Endpoints

    @GetMapping("/{id}/history")
    @Operation(summary = "Get employment history")
    public ResponseEntity<ApiResponse<List<EmploymentHistoryDto>>> getEmploymentHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.getEmploymentHistory(id));
    }

    @PostMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Add employment history")
    public ResponseEntity<ApiResponse<EmploymentHistoryDto>> addEmploymentHistory(
            @PathVariable UUID id,
            @Valid @RequestBody EmploymentHistoryDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.addEmploymentHistory(id, request));
    }

    @GetMapping("/{id}/contacts")
    @Operation(summary = "Get emergency contacts")
    public ResponseEntity<ApiResponse<List<EmergencyContactDto>>> getEmergencyContacts(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.getEmergencyContacts(id));
    }

    @PostMapping("/{id}/contacts")
    @Operation(summary = "Add emergency contact")
    public ResponseEntity<ApiResponse<EmergencyContactDto>> addEmergencyContact(
            @PathVariable UUID id,
            @Valid @RequestBody EmergencyContactDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.addEmergencyContact(id, request));
    }

    @GetMapping("/{id}/documents")
    @Operation(summary = "Get employee documents")
    public ResponseEntity<ApiResponse<List<EmployeeDocumentDto>>> getEmployeeDocuments(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.getEmployeeDocuments(id));
    }

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload employee document")
    public ResponseEntity<ApiResponse<EmployeeDocumentDto>> addEmployeeDocument(
            @PathVariable UUID id,
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.addEmployeeDocument(id, documentType, file));
    }

    @GetMapping("/{id}/documents/{documentId}/download")
    @Operation(summary = "Download employee document")
    public ResponseEntity<Resource> downloadEmployeeDocument(
            @PathVariable UUID id,
            @PathVariable UUID documentId) {
        try {
            Path filePath = employeeService.getEmployeeDocumentFile(id, documentId);
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
