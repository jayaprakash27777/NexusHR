package com.nexushr.auth.controller;

import com.nexushr.auth.model.User;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Tag(name = "User Admin", description = "Super Admin endpoints for user management")
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
public class UserAdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PatchMapping("/{userId}/access")
    @Operation(summary = "Toggle user access", description = "Enable or disable a user account login access")
    public ResponseEntity<ApiResponse<Boolean>> toggleAccess(
            @PathVariable UUID userId,
            @RequestBody Map<String, Boolean> request) {
        
        if (!request.containsKey("active")) {
            throw new IllegalArgumentException("Request must contain 'active' boolean flag");
        }
        
        boolean active = request.get("active");
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                
        user.setActive(active);
        userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success(
                "User access " + (active ? "enabled" : "disabled") + " successfully", active));
    }

    @PatchMapping("/{userId}/password")
    @Operation(summary = "Force change password", description = "Forcibly resets a user's password")
    public ResponseEntity<ApiResponse<Void>> forceChangePassword(
            @PathVariable UUID userId,
            @RequestBody Map<String, String> request) {
            
        if (!request.containsKey("newPassword")) {
            throw new IllegalArgumentException("Request must contain 'newPassword'");
        }
        
        String newPassword = request.get("newPassword");
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success("Password updated successfully", null));
    }

    @PatchMapping("/{userId}/mfa")
    @Operation(summary = "Toggle MFA", description = "Enable or disable MFA for a user")
    public ResponseEntity<ApiResponse<Boolean>> toggleMfa(
            @PathVariable UUID userId,
            @RequestBody Map<String, Boolean> request) {
        
        if (!request.containsKey("enabled")) {
            throw new IllegalArgumentException("Request must contain 'enabled' boolean flag");
        }
        
        boolean enabled = request.get("enabled");
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                
        user.setMfaEnabled(enabled);
        userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success(
                "MFA " + (enabled ? "enabled" : "disabled") + " successfully", enabled));
    }

    @PostMapping("/{userId}/logout")
    @Operation(summary = "Force Logout", description = "Force a user to logout by revoking their refresh tokens")
    public ResponseEntity<ApiResponse<Void>> forceLogout(
            @PathVariable UUID userId,
            @org.springframework.beans.factory.annotation.Autowired com.nexushr.auth.repository.RefreshTokenRepository refreshTokenRepository) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                
        refreshTokenRepository.revokeAllByUser(user);
        
        return ResponseEntity.ok(ApiResponse.success("User forced to logout successfully", null));
    }
}
