package com.nexushr.announcement.controller;

import com.nexushr.announcement.dto.AnnouncementDto;
import com.nexushr.announcement.dto.CreateAnnouncementRequest;
import com.nexushr.announcement.service.AnnouncementService;
import com.nexushr.auth.model.User;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.common.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
@Tag(name = "Announcements", description = "Endpoints for Announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final UserRepository userRepository;

    private UUID getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        return user.getId();
    }

    @GetMapping
    @Operation(summary = "Get visible announcements", description = "Get a paginated list of announcements visible to the current user")
    public ResponseEntity<ApiResponse<PagedResponse<AnnouncementDto>>> getAnnouncements(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                announcementService.getVisibleAnnouncements(getUserId(userDetails), page, size)));
    }

    @PostMapping
    @Operation(summary = "Create an announcement", description = "Create a new announcement with RBAC checks")
    public ResponseEntity<ApiResponse<AnnouncementDto>> createAnnouncement(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateAnnouncementRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                announcementService.createAnnouncement(getUserId(userDetails), request)));
    }

    @PostMapping("/{id}/react")
    @Operation(summary = "React to announcement", description = "Toggle a reaction (like/acknowledge) on an announcement")
    public ResponseEntity<ApiResponse<Void>> reactToAnnouncement(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> request) {
        String type = (request != null && request.containsKey("type")) ? request.get("type") : "ACKNOWLEDGE";
        announcementService.reactToAnnouncement(getUserId(userDetails), id, type);
        return ResponseEntity.ok(ApiResponse.success("Reaction updated successfully", null));
    }
}
