package com.nexushr.auth.controller;

import com.nexushr.auth.model.User;
import com.nexushr.common.dto.PagedResponse;
import com.nexushr.auth.model.LoginHistory;
import com.nexushr.auth.model.RefreshToken;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.nexushr.auth.dto.*;
import com.nexushr.auth.service.AuthService;
import com.nexushr.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication & authorization endpoints")
public class AuthController {

    private final AuthService authService;
    private final StringRedisTemplate redisTemplate;
    private final com.nexushr.auth.repository.UserRepository userRepository;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account with EMPLOYEE role")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates user and returns JWT tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Generates a new access token using a valid refresh token")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(
            @Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout", description = "Revokes the refresh token and blacklists the access token")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody TokenRefreshRequest request,
            HttpServletRequest servletRequest) {
            
        String bearerToken = servletRequest.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String jwt = bearerToken.substring(7);
            // Blacklist for 1 hour (default token expiration)
            redisTemplate.opsForValue().set("jwt_blacklist:" + jwt, "revoked", 1, TimeUnit.HOURS);
        }
        
        return ResponseEntity.ok(authService.logout(request.getRefreshToken()));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Changes the authenticated user's password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(authService.changePassword(request, auth.getName()));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Initiates password reset flow")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Resets password using a token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    @GetMapping("/sessions")
    @Operation(summary = "Get active sessions", description = "Returns a list of active sessions for the current user")
    public ResponseEntity<ApiResponse<List<RefreshToken>>> getActiveSessions(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"));
        return ResponseEntity.ok(authService.getActiveSessions(user.getId()));
    }

    @DeleteMapping("/sessions/{tokenId}")
    @Operation(summary = "Revoke session", description = "Revokes a specific active session")
    public ResponseEntity<ApiResponse<Void>> revokeSession(
            @PathVariable Long tokenId,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"));
        return ResponseEntity.ok(authService.revokeSession(user.getId(), tokenId));
    }

    @GetMapping("/login-history")
    @Operation(summary = "Get login history", description = "Returns paginated login history for the current user")
    public ResponseEntity<ApiResponse<PagedResponse<LoginHistory>>> getLoginHistory(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"));
        return ResponseEntity.ok(authService.getLoginHistory(user.getId(), page, size));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the currently authenticated user's details")
    public ResponseEntity<ApiResponse<AuthUserDto>> getCurrentUser(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        // Fetch real User entity using the email (username) from UserDetails
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found"));
        
        String role = user.getUserRoles().stream()
                .map(ur -> ur.getRole().getName())
                .findFirst()
                .orElse("EMPLOYEE");

        AuthUserDto dto = AuthUserDto.builder()
                .id(user.getId())
                .username(user.getEmail())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(role)
                .avatar(user.getAvatarUrl())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Current user retrieved successfully", dto));
    }
}
