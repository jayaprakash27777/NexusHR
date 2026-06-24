package com.nexushr.employee.service;

import com.nexushr.auth.model.Role;
import com.nexushr.auth.model.User;
import com.nexushr.auth.model.UserRole;
import com.nexushr.auth.model.UserRoleKey;
import com.nexushr.auth.repository.RoleRepository;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.department.model.Department;
import com.nexushr.department.repository.DepartmentRepository;
import com.nexushr.employee.dto.CreateEmployeeRequest;
import com.nexushr.employee.dto.EmployeeResponse;
import com.nexushr.employee.dto.UpdateEmployeeRequest;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.model.EmployeeStatus;
import com.nexushr.employee.model.EmploymentHistory;
import com.nexushr.employee.model.EmergencyContact;
import com.nexushr.employee.model.EmployeeDocument;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.employee.repository.EmploymentHistoryRepository;
import com.nexushr.employee.repository.EmergencyContactRepository;
import com.nexushr.employee.repository.EmployeeDocumentRepository;
import com.nexushr.common.storage.FileStorageService;
import com.nexushr.employee.dto.EmploymentHistoryDto;
import com.nexushr.employee.dto.EmergencyContactDto;
import com.nexushr.employee.dto.EmployeeDocumentDto;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.time.OffsetDateTime;
import com.nexushr.common.exception.BadRequestException;
import com.nexushr.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmploymentHistoryRepository employmentHistoryRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final EmployeeDocumentRepository employeeDocumentRepository;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public ApiResponse<EmployeeResponse> create(CreateEmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Employee with email '" + request.getEmail() + "' already exists");
        }

        // Generate employee ID from sequence
        Long seqValue = employeeRepository.getNextEmployeeIdSequence();
        String employeeId = "NHR-" + seqValue;

        // Resolve department
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
        }

        // Resolve manager
        Employee manager = null;
        if (request.getManagerId() != null) {
            manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee (Manager)", "id", request.getManagerId()));
        }

        // Optionally create user account
        User user = null;
        if (request.isCreateUserAccount()) {
            user = createUserAccount(request);
        }

        Employee employee = Employee.builder()
                .employeeId(employeeId)
                .user(user)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail().toLowerCase())
                .phone(request.getPhone())
                .avatarUrl(request.getAvatarUrl())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .address(request.getAddress())
                .permanentAddress(request.getPermanentAddress())
                .employmentType(request.getEmploymentType() != null ? request.getEmploymentType() : com.nexushr.employee.model.EmploymentType.FULL_TIME)
                .panNumber(request.getPanNumber())
                .pfNumber(request.getPfNumber())
                .esiNumber(request.getEsiNumber())
                .uanNumber(request.getUanNumber())
                .department(department)
                .designation(request.getDesignation())
                .salary(request.getSalary() != null ? request.getSalary() : java.math.BigDecimal.ZERO)
                .joiningDate(request.getJoiningDate())
                .manager(manager)
                .status(EmployeeStatus.ACTIVE)
                .build();

        Employee saved = employeeRepository.save(employee);
        log.info("Employee created: {} ({})", saved.getFullName(), saved.getEmployeeId());

        return ApiResponse.success("Employee created successfully", mapToResponse(saved));
    }

    @Override
    @Transactional
    public ApiResponse<EmployeeResponse> update(UUID id, UpdateEmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        if (request.getFirstName() != null) employee.setFirstName(request.getFirstName());
        if (request.getLastName() != null) employee.setLastName(request.getLastName());
        if (request.getPhone() != null) employee.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) employee.setAvatarUrl(request.getAvatarUrl());
        if (request.getDateOfBirth() != null) employee.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) employee.setGender(request.getGender());
        if (request.getAddress() != null) employee.setAddress(request.getAddress());
        if (request.getDesignation() != null) employee.setDesignation(request.getDesignation());
        if (request.getSalary() != null) employee.setSalary(request.getSalary());
        if (request.getStatus() != null) employee.setStatus(request.getStatus());

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
            employee.setDepartment(department);
        }

        if (request.getManagerId() != null) {
            if (request.getManagerId().equals(id)) {
                throw new BadRequestException("An employee cannot be their own manager");
            }
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee (Manager)", "id", request.getManagerId()));
            employee.setManager(manager);
        }

        Employee updated = employeeRepository.save(employee);
        log.info("Employee updated: {} ({})", updated.getFullName(), updated.getEmployeeId());

        return ApiResponse.success("Employee updated successfully", mapToResponse(updated));
    }

    @Override
    @Transactional
    public ApiResponse<EmployeeResponse> uploadAvatar(UUID id, MultipartFile file) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        String directory = "employees/" + id + "/avatar";
        String fileName = fileStorageService.storeFile(file, directory);
        
        employee.setAvatarUrl("/api/employees/" + id + "/avatar/download?fileName=" + fileName);
        Employee updated = employeeRepository.save(employee);
        
        log.info("Employee avatar updated: {}", employee.getEmployeeId());
        return ApiResponse.success("Avatar uploaded successfully", mapToResponse(updated));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<EmployeeResponse> getById(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return ApiResponse.success(mapToResponse(employee));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<EmployeeResponse> getByEmployeeId(String employeeId) {
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "employeeId", employeeId));
        return ApiResponse.success(mapToResponse(employee));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> getAll(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return buildPagedResponse(employeeRepository.findAll(pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("firstName").ascending());
        return buildPagedResponse(employeeRepository.search(query, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> getByDepartment(UUID departmentId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("firstName").ascending());
        return buildPagedResponse(employeeRepository.findByDepartmentId(departmentId, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> getByManager(UUID managerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("firstName").ascending());
        return buildPagedResponse(employeeRepository.findByManagerId(managerId, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> getByStatus(EmployeeStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("firstName").ascending());
        return buildPagedResponse(employeeRepository.findByStatus(status, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<EmployeeResponse> filter(String query, UUID departmentId, EmployeeStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("firstName").ascending());
        return buildPagedResponse(employeeRepository.findWithFilters(query, departmentId, status, pageable));
    }

    @Override
    @Transactional
    public ApiResponse<Void> delete(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));

        employee.setStatus(EmployeeStatus.TERMINATED);
        employeeRepository.save(employee);

        // Deactivate linked user account
        if (employee.getUser() != null) {
            User user = employee.getUser();
            user.setActive(false);
            userRepository.save(user);
        }

        log.info("Employee terminated: {} ({})", employee.getFullName(), employee.getEmployeeId());
        return ApiResponse.success("Employee terminated successfully");
    }

    @Override
    @Transactional
    public ApiResponse<EmployeeResponse> updateStatus(UUID id, EmployeeStatus status) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employee.setStatus(status);
        Employee updated = employeeRepository.save(employee);
        log.info("Employee status updated: {} -> {}", employee.getEmployeeId(), status);
        return ApiResponse.success("Employee status updated", mapToResponse(updated));
    }

    // Phase 2: Implementation of deep profile operations

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EmploymentHistoryDto>> getEmploymentHistory(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        List<EmploymentHistoryDto> history = employmentHistoryRepository.findByEmployeeIdOrderByEffectiveDateDesc(employee.getId())
                .stream().map(h -> EmploymentHistoryDto.builder()
                        .id(h.getId())
                        .employeeId(employee.getId())
                        .departmentId(h.getDepartment() != null ? h.getDepartment().getId() : null)
                        .departmentName(h.getDepartment() != null ? h.getDepartment().getName() : null)
                        .previousDesignation(h.getPreviousDesignation())
                        .newDesignation(h.getNewDesignation())
                        .effectiveDate(h.getEffectiveDate())
                        .changeReason(h.getChangeReason())
                        .build()).collect(Collectors.toList());
        return ApiResponse.success(history);
    }

    @Override
    @Transactional
    public ApiResponse<EmploymentHistoryDto> addEmploymentHistory(UUID employeeId, EmploymentHistoryDto request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        
        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", request.getDepartmentId()));
        }

        EmploymentHistory history = EmploymentHistory.builder()
                .employee(employee)
                .department(department)
                .previousDesignation(request.getPreviousDesignation())
                .newDesignation(request.getNewDesignation())
                .effectiveDate(request.getEffectiveDate())
                .changeReason(request.getChangeReason())
                .build();
                
        EmploymentHistory saved = employmentHistoryRepository.save(history);
        
        // Also update the employee's current designation/department
        if (request.getNewDesignation() != null) employee.setDesignation(request.getNewDesignation());
        if (department != null) employee.setDepartment(department);
        employeeRepository.save(employee);
        
        request.setId(saved.getId());
        request.setDepartmentName(department != null ? department.getName() : null);
        return ApiResponse.success("Employment history added", request);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EmergencyContactDto>> getEmergencyContacts(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        List<EmergencyContactDto> contacts = emergencyContactRepository.findByEmployeeId(employee.getId())
                .stream().map(c -> EmergencyContactDto.builder()
                        .id(c.getId())
                        .employeeId(employee.getId())
                        .name(c.getName())
                        .relationship(c.getRelationship())
                        .phoneNumber(c.getPhoneNumber())
                        .email(c.getEmail())
                        .isPrimary(c.isPrimary())
                        .build()).collect(Collectors.toList());
        return ApiResponse.success(contacts);
    }

    @Override
    @Transactional
    public ApiResponse<EmergencyContactDto> addEmergencyContact(UUID employeeId, EmergencyContactDto request) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
                
        EmergencyContact contact = EmergencyContact.builder()
                .employee(employee)
                .name(request.getName())
                .relationship(request.getRelationship())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .isPrimary(request.isPrimary())
                .build();
                
        EmergencyContact saved = emergencyContactRepository.save(contact);
        request.setId(saved.getId());
        return ApiResponse.success("Emergency contact added", request);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EmployeeDocumentDto>> getEmployeeDocuments(UUID employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        List<EmployeeDocumentDto> docs = employeeDocumentRepository.findByEmployeeIdOrderByUploadDateDesc(employee.getId())
                .stream().map(d -> EmployeeDocumentDto.builder()
                        .id(d.getId())
                        .employeeId(employee.getId())
                        .documentType(d.getDocumentType())
                        .fileName(d.getFileName())
                        .contentType(d.getContentType())
                        .fileSize(d.getFileSize())
                        .uploadDate(d.getUploadDate())
                        .build()).collect(Collectors.toList());
        return ApiResponse.success(docs);
    }

    @Override
    @Transactional
    public ApiResponse<EmployeeDocumentDto> addEmployeeDocument(UUID employeeId, String documentType, MultipartFile file) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
                
        String directory = "employees/" + employeeId;
        String fileName = fileStorageService.storeFile(file, directory);
        
        EmployeeDocument document = EmployeeDocument.builder()
                .employee(employee)
                .documentType(documentType)
                .fileName(file.getOriginalFilename())
                .filePath(directory + "/" + fileName)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .uploadDate(OffsetDateTime.now())
                .build();
                
        EmployeeDocument saved = employeeDocumentRepository.save(document);
        
        EmployeeDocumentDto dto = EmployeeDocumentDto.builder()
                .id(saved.getId())
                .employeeId(employee.getId())
                .documentType(saved.getDocumentType())
                .fileName(saved.getFileName())
                .contentType(saved.getContentType())
                .fileSize(saved.getFileSize())
                .uploadDate(saved.getUploadDate())
                .build();
                
        return ApiResponse.success("Document uploaded successfully", dto);
    }

    @Override
    @Transactional(readOnly = true)
    public Path getEmployeeDocumentFile(UUID employeeId, UUID documentId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));
        EmployeeDocument document = employeeDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", documentId));
                
        if (!document.getEmployee().getId().equals(employee.getId())) {
            throw new BadRequestException("Document does not belong to this employee");
        }
        
        // filePath is "employees/UUID/filename.ext"
        String[] parts = document.getFilePath().split("/");
        if (parts.length < 3) throw new ResourceNotFoundException("File", "path", document.getFilePath());
        
        String directory = parts[0] + "/" + parts[1];
        String fileName = parts[2];
        return fileStorageService.loadFileAsResource(fileName, directory);
    }

    private User createUserAccount(CreateEmployeeRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return userRepository.findByEmail(request.getEmail()).orElse(null);
        }

        String targetRoleName = request.getRoleName() != null ? request.getRoleName() : "ROLE_EMPLOYEE";

        // RBAC Matrix Validation
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isSuperAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN"));
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isHrDirector = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_HR_DIRECTOR"));
        boolean isHrExecutive = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_HR_EXECUTIVE"));

        if (!isSuperAdmin) {
            if (isAdmin && targetRoleName.equals("ROLE_SUPER_ADMIN")) {
                throw new AccessDeniedException("ADMIN cannot create SUPER_ADMIN accounts");
            } else if (isHrDirector && !(targetRoleName.equals("ROLE_EMPLOYEE") || targetRoleName.equals("ROLE_HR_EXECUTIVE") || targetRoleName.equals("ROLE_TEAM_LEAD"))) {
                throw new AccessDeniedException("HR_DIRECTOR can only create EMPLOYEE, HR_EXECUTIVE, or TEAM_LEAD accounts");
            } else if (isHrExecutive && !targetRoleName.equals("ROLE_EMPLOYEE")) {
                throw new AccessDeniedException("HR_EXECUTIVE can only create EMPLOYEE accounts");
            } else if (!isAdmin && !isHrDirector && !isHrExecutive) {
                throw new AccessDeniedException("You do not have permission to create user accounts");
            }
        }

        Role employeeRole = roleRepository.findByName(targetRoleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", targetRoleName));

        // Default password: first name + @123 (user should change on first login)
        String defaultPassword = request.getFirstName().toLowerCase() + "@123";

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(defaultPassword))
                .phone(request.getPhone())
                .active(true)
                .emailVerified(false)
                .build();

        UserRole userRole = UserRole.builder()
                .id(new UserRoleKey(null, employeeRole.getId()))
                .user(user)
                .role(employeeRole)
                .build();
        user.getUserRoles().add(userRole);

        User saved = userRepository.save(user);
        log.info("User account created for employee: {} with role: {}", saved.getEmail(), targetRoleName);
        return saved;
    }

    private EmployeeResponse mapToResponse(Employee employee) {
        return EmployeeResponse.builder()
                .id(employee.getId())
                .employeeId(employee.getEmployeeId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .avatarUrl(employee.getAvatarUrl())
                .phone(employee.getPhone())
                .dateOfBirth(employee.getDateOfBirth())
                .gender(employee.getGender())
                .address(employee.getAddress())
                .permanentAddress(employee.getPermanentAddress())
                .employmentType(employee.getEmploymentType())
                .panNumber(employee.getPanNumber())
                .pfNumber(employee.getPfNumber())
                .esiNumber(employee.getEsiNumber())
                .uanNumber(employee.getUanNumber())
                .bankName(employee.getBankName())
                .bankAccountNumber(employee.getBankAccountNumber())
                .departmentId(employee.getDepartment() != null ? employee.getDepartment().getId() : null)
                .departmentName(employee.getDepartment() != null ? employee.getDepartment().getName() : null)
                .departmentCode(employee.getDepartment() != null ? employee.getDepartment().getCode() : null)
                .designation(employee.getDesignation())
                .salary(employee.getSalary())
                .joiningDate(employee.getJoiningDate())
                .managerId(employee.getManager() != null ? employee.getManager().getId() : null)
                .managerName(employee.getManager() != null ? employee.getManager().getFullName() : null)
                .status(employee.getStatus())
                .hasUserAccount(employee.getUser() != null)
                .roles(employee.getUser() != null ? employee.getUser().getUserRoles().stream()
                        .map(ur -> ur.getRole().getName()).collect(java.util.stream.Collectors.toList()) : null)
                .mfaEnabled(employee.getUser() != null ? employee.getUser().isMfaEnabled() : false)
                .lastLogin(employee.getUser() != null ? employee.getUser().getLastSeenAt() : null)
                .createdAt(employee.getCreatedAt())
                .updatedAt(employee.getUpdatedAt())
                .build();
    }

    private PagedResponse<EmployeeResponse> buildPagedResponse(Page<Employee> page) {
        List<EmployeeResponse> content = page.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return PagedResponse.<EmployeeResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .build();
    }
}
