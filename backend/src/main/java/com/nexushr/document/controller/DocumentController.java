package com.nexushr.document.controller;

import com.nexushr.common.audit.AuditService;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.document.model.Document;
import com.nexushr.document.service.DocumentService;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.auth.model.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final AuditService auditService;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    private UUID getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private boolean isSuperAdminOrHR() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SUPER_ADMIN") || a.getAuthority().equals("ROLE_HR_DIRECTOR") || a.getAuthority().equals("SYSTEM_ADMIN"));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_DIRECTOR')")
    public ResponseEntity<ApiResponse<List<Document>>> getAllDocuments() {
        return ResponseEntity.ok(ApiResponse.success(documentService.getAllDocuments()));
    }

    @GetMapping("/employee/{ownerId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_DIRECTOR') or @securityService.isSelf(#ownerId)")
    public ResponseEntity<ApiResponse<List<Document>>> getEmployeeDocuments(@PathVariable UUID ownerId) {
        return ResponseEntity.ok(ApiResponse.success(documentService.getDocumentsByOwner(ownerId)));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_DIRECTOR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<ApiResponse<Document>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam(value = "ownerId", required = false) UUID ownerId) {
            
        UUID currentUser = getCurrentUserId();
        
        UUID finalOwnerId = ownerId;
        if (!isSuperAdminOrHR()) {
            // Non-admins must use their own employee ID
            Employee emp = employeeRepository.findByUserId(currentUser).orElseThrow(() -> new RuntimeException("Employee profile not found"));
            finalOwnerId = emp.getId();
        } else if (ownerId == null) {
            // Admin didn't specify owner, default to their own employee ID if exists
            Employee emp = employeeRepository.findByUserId(currentUser).orElse(null);
            finalOwnerId = emp != null ? emp.getId() : null;
        }

        Document document = documentService.uploadDocument(file, title, category, finalOwnerId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(document));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_DIRECTOR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID id) {
        Document doc = documentService.getDocumentById(id).orElseThrow();
        checkDocumentAccess(doc);
        
        Resource resource = documentService.loadDocumentAsResource(id);
        
        auditService.log(getCurrentUserId(), "DOCUMENT_DOWNLOAD", "Document", id.toString(), "Downloaded document: " + doc.getTitle());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/{id}/preview")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_DIRECTOR', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<Resource> previewDocument(@PathVariable UUID id) {
        Document doc = documentService.getDocumentById(id).orElseThrow();
        checkDocumentAccess(doc);
        
        Resource resource = documentService.loadDocumentAsResource(id);
        
        auditService.log(getCurrentUserId(), "DOCUMENT_PREVIEW", "Document", id.toString(), "Previewed document: " + doc.getTitle());

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
    
    private void checkDocumentAccess(Document doc) {
        if (!isSuperAdminOrHR()) {
            Employee emp = employeeRepository.findByUserId(getCurrentUserId()).orElse(null);
            if (emp == null || doc.getOwner() == null || !doc.getOwner().getId().equals(emp.getId())) {
                throw new RuntimeException("Access Denied: You can only access your own documents");
            }
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_DIRECTOR')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable UUID id) {
        documentService.deleteDocument(id, getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
