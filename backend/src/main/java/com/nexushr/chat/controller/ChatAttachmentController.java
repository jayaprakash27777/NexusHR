package com.nexushr.chat.controller;

import com.nexushr.auth.model.User;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.chat.dto.ChatMessageDto;
import com.nexushr.chat.model.ChatMessage;
import com.nexushr.chat.model.Conversation;
import com.nexushr.chat.model.enums.MessageType;
import com.nexushr.chat.repository.ChatMessageRepository;
import com.nexushr.chat.repository.ConversationRepository;
import com.nexushr.chat.websocket.RedisPubSubService;
import com.nexushr.common.storage.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/chat/attachments")
@RequiredArgsConstructor
@Slf4j
public class ChatAttachmentController {

    private final FileStorageService fileStorageService;
    private final ChatMessageRepository chatMessageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final RedisPubSubService redisPubSubService;

    private static final String ATTACHMENTS_DIR = "chat-attachments";

    @PostMapping
    @Transactional
    public ResponseEntity<ChatMessageDto> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam("conversationId") UUID conversationId,
            Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        User sender = userRepository.findByEmail(principal.getName()).orElseThrow();
        Conversation conversation = conversationRepository.findById(conversationId).orElseThrow();

        String fileName = fileStorageService.storeFile(file, ATTACHMENTS_DIR);
        String fileType = file.getContentType();
        long fileSize = file.getSize();

        // Determine Message Type
        MessageType messageType = MessageType.FILE;
        if (fileType != null && fileType.startsWith("image/")) {
            messageType = MessageType.IMAGE;
        }

        // Save metadata to database
        ChatMessage message = new ChatMessage();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(file.getOriginalFilename() != null ? file.getOriginalFilename() : "Attachment");
        message.setMessageType(messageType);
        message.setFileUrl("/api/chat/attachments/" + fileName);
        message.setFileName(file.getOriginalFilename());
        message.setFileSize(fileSize);
        message.setFileType(fileType);

        message = chatMessageRepository.save(message);

        // Update conversation timestamp
        conversation.setUpdatedAt(message.getCreatedAt());
        conversationRepository.save(conversation);

        // Map to DTO
        ChatMessageDto dto = ChatMessageDto.builder()
                .id(message.getId())
                .conversationId(conversation.getId())
                .senderId(sender.getId())
                .senderName(sender.getFullName())
                .content(message.getContent())
                .messageType(message.getMessageType())
                .status(message.getStatus())
                .deliveredCount(message.getDeliveredCount())
                .readCount(message.getReadCount())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .fileSize(message.getFileSize())
                .fileType(message.getFileType())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .build();

        // Broadcast to WebSocket clients via Redis
        redisPubSubService.broadcastMessage(dto);

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable String fileName, HttpServletRequest request) {
        try {
            Path filePath = fileStorageService.loadFileAsResource(fileName, ATTACHMENTS_DIR);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception ex) {
            log.error("Could not download file", ex);
            return ResponseEntity.internalServerError().build();
        }
    }
}
