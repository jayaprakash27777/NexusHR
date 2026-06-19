package com.nexushr.auth.service;

import com.nexushr.auth.dto.*;
import com.nexushr.common.dto.ApiResponse;

public interface AuthService {

    ApiResponse<AuthResponse> register(RegisterRequest request);

    ApiResponse<AuthResponse> login(LoginRequest request);

    ApiResponse<TokenRefreshResponse> refreshToken(TokenRefreshRequest request);

    ApiResponse<Void> logout(String refreshToken);

    ApiResponse<Void> changePassword(ChangePasswordRequest request, String userEmail);

    ApiResponse<Void> forgotPassword(ForgotPasswordRequest request);

    ApiResponse<Void> resetPassword(ResetPasswordRequest request);

    ApiResponse<com.nexushr.common.dto.PagedResponse<com.nexushr.auth.model.LoginHistory>> getLoginHistory(java.util.UUID userId, int page, int size);

    ApiResponse<java.util.List<com.nexushr.auth.model.RefreshToken>> getActiveSessions(java.util.UUID userId);

    ApiResponse<Void> revokeSession(java.util.UUID userId, Long tokenId);
}
