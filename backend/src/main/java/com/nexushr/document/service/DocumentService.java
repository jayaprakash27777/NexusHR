package com.nexushr.document.service;

import com.nexushr.auth.model.User;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.common.audit.AuditService;
import com.nexushr.document.model.Document;
import com.nexushr.document.repository.DocumentRepository;
import com.nexushr.employee.model.Employee;
import com.nexushr.employee.repository.EmployeeRepository;
import com.nexushr.common.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final FileStorageService fileStorageService;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    public List<Document> getDocumentsByOwner(UUID ownerId) {
        return documentRepository.findByOwnerId(ownerId);
    }
    
    public Optional<Document> getDocumentById(UUID id) {
        return documentRepository.findById(id);
    }

    public Resource loadDocumentAsResource(UUID id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        try {
            java.nio.file.Path filePath = fileStorageService.loadFileAsResource(document.getFileUrl(), "documents");
            return new UrlResource(filePath.toUri());
        } catch (java.net.MalformedURLException e) {
            throw new RuntimeException("Error loading file: " + document.getFileUrl(), e);
        }
    }

    @Transactional
    public Document uploadDocument(MultipartFile file, String title, String category, UUID ownerId, UUID uploaderId) {
        String originalFilename = file.getOriginalFilename();
        String fileType = file.getContentType();
        long fileSize = file.getSize();

        // Store file physically
        String savedFileName = fileStorageService.storeFile(file, "documents");

        // Map related entities
        Employee owner = null;
        if (ownerId != null) {
            owner = employeeRepository.findById(ownerId)
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
        }

        User uploader = userRepository.findById(uploaderId)
                .orElseThrow(() -> new RuntimeException("Uploader not found"));

        // Save DB record
        Document document = Document.builder()
                .title(title)
                .fileUrl(savedFileName)
                .fileType(fileType != null ? fileType : "application/octet-stream")
                .fileSize(fileSize)
                .category(category)
                .owner(owner)
                .uploadedBy(uploader)
                .status("ACTIVE")
                .build();

        Document savedDoc = documentRepository.save(document);

        // Audit Log
        auditService.log(uploaderId, "DOCUMENT_UPLOAD", "Document", savedDoc.getId().toString(), 
                "Uploaded document: " + title + " (" + savedFileName + ")");

        return savedDoc;
    }

    @Transactional
    public void deleteDocument(UUID id, UUID userId) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
                
        // Delete physical file
        fileStorageService.deleteFile(document.getFileUrl(), "documents");
        
        // Delete from DB
        documentRepository.deleteById(id);

        // Audit Log
        auditService.log(userId, "DOCUMENT_DELETE", "Document", id.toString(), 
                "Deleted document: " + document.getTitle());
    }
}
