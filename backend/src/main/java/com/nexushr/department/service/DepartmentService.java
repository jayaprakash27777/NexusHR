package com.nexushr.department.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.department.dto.DepartmentRequest;
import com.nexushr.department.dto.DepartmentResponse;

import java.util.List;
import java.util.UUID;

public interface DepartmentService {

    ApiResponse<DepartmentResponse> create(DepartmentRequest request);

    ApiResponse<DepartmentResponse> update(UUID id, DepartmentRequest request);

    ApiResponse<DepartmentResponse> getById(UUID id);

    ApiResponse<DepartmentResponse> getByCode(String code);

    ApiResponse<List<DepartmentResponse>> getAll();

    PagedResponse<DepartmentResponse> getAllPaged(int page, int size, String sortBy, String direction);

    PagedResponse<DepartmentResponse> search(String query, int page, int size);

    ApiResponse<Void> delete(UUID id);

    ApiResponse<DepartmentResponse> assignManager(UUID departmentId, UUID managerId);
}
