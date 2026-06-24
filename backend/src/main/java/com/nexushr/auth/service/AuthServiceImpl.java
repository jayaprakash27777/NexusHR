package com.nexushr.auth.service;

import com.nexushr.auth.dto.*;
import com.nexushr.auth.model.RefreshToken;
import com.nexushr.auth.model.Role;
import com.nexushr.auth.model.User;
import com.nexushr.auth.model.UserRole;
import com.nexushr.auth.model.UserRoleKey;
import com.nexushr.auth.repository.RoleRepository;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.common.dto.ApiResponse;
import com.nexushr.common.exception.BadRequestException;
import com.nexushr.common.exception.ResourceNotFoundException;
import com.nexushr.common.dto.PagedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import java.util.List;
import com.nexushr.auth.model.PasswordResetToken;
import com.nexushr.auth.model.LoginHistory;
import com.nexushr.auth.repository.PasswordResetTokenRepository;
import com.nexushr.auth.repository.LoginHistoryRepository;
import com.nexushr.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import java.time.OffsetDateTime;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final LoginHistoryRepository loginHistoryRepository;

    @Override
    @Transactional
    public ApiResponse<AuthResponse> register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        Role employeeRole = roleRepository.findByName("ROLE_EMPLOYEE")
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "ROLE_EMPLOYEE"));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
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

        User savedUser = userRepository.save(user);
        log.info("User registered successfully: {}", savedUser.getEmail());

        // Authenticate and generate tokens
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword()));

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(savedUser);

        AuthResponse authResponse = buildAuthResponse(savedUser, accessToken, refreshToken.getToken());

        return ApiResponse.success("Registration successful", authResponse);
    }

    @Override
    @Transactional
    public ApiResponse<AuthResponse> login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (!user.isActive()) {
            throw new BadRequestException("Account is deactivated. Please contact administrator.");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        log.info("User logged in: {}", user.getEmail());
        recordLoginHistory(user, "SUCCESS", null);

        AuthResponse authResponse = buildAuthResponse(user, accessToken, refreshToken.getToken());

        return ApiResponse.success("Login successful", authResponse);
    }

    private void recordLoginHistory(User user, String status, String failureReason) {
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
            String ipAddress = request.getHeader("X-Forwarded-For");
            if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getRemoteAddr();
            }
            String userAgent = request.getHeader("User-Agent");
            
            LoginHistory history = LoginHistory.builder()
                    .user(user)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .status(status)
                    .failureReason(failureReason)
                    .build();
            loginHistoryRepository.save(history);
        } catch (Exception e) {
            log.warn("Failed to record login history", e);
        }
    }

    @Override
    @Transactional
    public ApiResponse<TokenRefreshResponse> refreshToken(TokenRefreshRequest request) {
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(request.getRefreshToken());
        User user = refreshToken.getUser();

        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);

        TokenRefreshResponse response = TokenRefreshResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken.getToken())
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .build();

        return ApiResponse.success("Token refreshed successfully", response);
    }

    @Override
    @Transactional
    public ApiResponse<Void> logout(String refreshToken) {
        refreshTokenService.revokeToken(refreshToken);
        log.info("User logged out, refresh token revoked");
        return ApiResponse.success("Logout successful");
    }

    @Override
    @Transactional
    public ApiResponse<Void> changePassword(ChangePasswordRequest request, String userEmail) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Revoke all refresh tokens to force re-login
        refreshTokenService.revokeAllUserTokens(user);

        log.info("Password changed for user: {}", userEmail);
        return ApiResponse.success("Password changed successfully. Please login again.");
    }

    @Override
    @Transactional
    public ApiResponse<Void> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElse(null);

        if (user != null) {
            // Delete old tokens
            passwordResetTokenRepository.deleteByUser(user);

            // Generate new token
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiresAt(OffsetDateTime.now().plusHours(24))
                    .build();
            passwordResetTokenRepository.save(resetToken);

            log.info("Password reset token generated for: {}. Token: {}", request.getEmail(), token);
            // In a real system, send email here.
        }

        return ApiResponse.success("If an account exists with this email, a password reset link has been sent.");
    }

    @Override
    @Transactional
    public ApiResponse<Void> resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        if (resetToken.isExpired() || resetToken.isUsed()) {
            throw new BadRequestException("Token is expired or has already been used");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Revoke all existing sessions
        refreshTokenService.revokeAllUserTokens(user);

        log.info("Password successfully reset for user: {}", user.getEmail());
        return ApiResponse.success("Password successfully reset. You can now log in.");
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<PagedResponse<LoginHistory>> getLoginHistory(UUID userId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<LoginHistory> historyPage = loginHistoryRepository.findByUserId(userId, pageable);
        
        PagedResponse<LoginHistory> response = PagedResponse.<LoginHistory>builder()
                .content(historyPage.getContent())
                .page(historyPage.getNumber())
                .size(historyPage.getSize())
                .totalElements(historyPage.getTotalElements())
                .totalPages(historyPage.getTotalPages())
                .first(historyPage.isFirst())
                .last(historyPage.isLast())
                .build();
                
        return ApiResponse.success(response);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<RefreshToken>> getActiveSessions(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        List<RefreshToken> activeTokens = refreshTokenService.getAllUserTokens(user)
                .stream()
                .filter(RefreshToken::isValid)
                .collect(Collectors.toList());
        return ApiResponse.success(activeTokens);
    }

    @Override
    @Transactional
    public ApiResponse<Void> revokeSession(UUID userId, Long tokenId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        refreshTokenService.revokeTokenById(tokenId, user);
        return ApiResponse.success("Session revoked successfully");
    }
    
    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        com.nexushr.auth.model.Role primaryRole = user.getUserRoles().stream()
                .map(com.nexushr.auth.model.UserRole::getRole)
                .min((r1, r2) -> {
                    if (r1.getName().equals("ROLE_EMPLOYEE")) return 1;
                    if (r2.getName().equals("ROLE_EMPLOYEE")) return -1;
                    return 0;
                })
                .orElse(null);

        String roleName = primaryRole != null ? primaryRole.getName() : "ROLE_EMPLOYEE";
        String dashboardUrl = primaryRole != null ? primaryRole.getDefaultDashboard() : "/dashboard/employee";

        AuthUserDto userDto = AuthUserDto.builder()
                .id(user.getId())
                .username(user.getEmail())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(roleName)
                .dashboardUrl(dashboardUrl)
                .avatar(user.getAvatarUrl())
                .build();

        return AuthResponse.builder()
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .roles(user.getUserRoles().stream()
                        .map(userRole -> userRole.getRole().getName())
                        .collect(Collectors.toSet()))
                .user(userDto)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpirationMs() / 1000)
                .build();
    }
}
