package com.nexushr.payroll.service;

import com.nexushr.common.dto.ApiResponse;
import com.nexushr.payroll.dto.SalaryStructureRequest;
import com.nexushr.payroll.dto.SalaryStructureResponse;

import java.util.List;
import java.util.UUID;

public interface SalaryStructureService {
    ApiResponse<SalaryStructureResponse> createStructure(SalaryStructureRequest request);
    ApiResponse<SalaryStructureResponse> updateStructure(UUID id, SalaryStructureRequest request);
    ApiResponse<Void> deleteStructure(UUID id);
    ApiResponse<SalaryStructureResponse> getStructureById(UUID id);
    ApiResponse<List<SalaryStructureResponse>> getAllStructures();
}
