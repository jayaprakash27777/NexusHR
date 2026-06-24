package com.nexushr.employee.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.employee.dto.CreateEmployeeRequest;
import com.nexushr.employee.dto.EmployeeResponse;
import com.nexushr.employee.dto.UpdateEmployeeRequest;
import com.nexushr.employee.model.EmployeeStatus;

import com.nexushr.employee.dto.*;
import com.nexushr.employee.model.EmployeeStatus;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

public interface EmployeeService {

    ApiResponse<EmployeeResponse> create(CreateEmployeeRequest request);

    ApiResponse<EmployeeResponse> update(UUID id, UpdateEmployeeRequest request);

    ApiResponse<EmployeeResponse> uploadAvatar(UUID id, MultipartFile file);

    ApiResponse<EmployeeResponse> getById(UUID id);

    ApiResponse<EmployeeResponse> getByEmployeeId(String employeeId);

    PagedResponse<EmployeeResponse> getAll(int page, int size, String sortBy, String direction);

    PagedResponse<EmployeeResponse> search(String query, int page, int size);

    PagedResponse<EmployeeResponse> getByDepartment(UUID departmentId, int page, int size);

    PagedResponse<EmployeeResponse> getByManager(UUID managerId, int page, int size);

    PagedResponse<EmployeeResponse> getByStatus(EmployeeStatus status, int page, int size);

    PagedResponse<EmployeeResponse> filter(String query, UUID departmentId, EmployeeStatus status, int page, int size);

    ApiResponse<Void> delete(UUID id);

    ApiResponse<EmployeeResponse> updateStatus(UUID id, EmployeeStatus status);

    // Phase 2: History, Contacts, Documents
    ApiResponse<List<EmploymentHistoryDto>> getEmploymentHistory(UUID employeeId);
    ApiResponse<EmploymentHistoryDto> addEmploymentHistory(UUID employeeId, EmploymentHistoryDto request);
    
    ApiResponse<List<EmergencyContactDto>> getEmergencyContacts(UUID employeeId);
    ApiResponse<EmergencyContactDto> addEmergencyContact(UUID employeeId, EmergencyContactDto request);
    
    ApiResponse<List<EmployeeDocumentDto>> getEmployeeDocuments(UUID employeeId);
    ApiResponse<EmployeeDocumentDto> addEmployeeDocument(UUID employeeId, String documentType, MultipartFile file);
    Path getEmployeeDocumentFile(UUID employeeId, UUID documentId);
}
