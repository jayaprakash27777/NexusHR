package com.nexushr.auth.service;

import com.nexushr.auth.model.RefreshToken;
import com.nexushr.auth.model.User;
import com.nexushr.auth.repository.RefreshTokenRepository;
import com.nexushr.common.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @Transactional
    public RefreshToken createRefreshToken(User user) {
        // Revoke existing tokens for this user
        refreshTokenRepository.revokeAllByUser(user);

        var builder = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(Instant.now().plusMillis(refreshTokenExpirationMs))
                .revoked(false);

        try {
            jakarta.servlet.http.HttpServletRequest request = ((org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes()).getRequest();
            String ipAddress = request.getHeader("X-Forwarded-For");
            if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getRemoteAddr();
            }
            builder.ipAddress(ipAddress);
            builder.userAgent(request.getHeader("User-Agent"));
            builder.deviceType("Web Browser"); // Or extract from user agent
        } catch (Exception e) {
            log.warn("Could not extract request details for refresh token", e);
        }

        RefreshToken finalRefreshToken = builder.build();

        return refreshTokenRepository.save(finalRefreshToken);
    }

    @Transactional(readOnly = true)
    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (!refreshToken.isValid()) {
            throw new UnauthorizedException("Refresh token has expired or been revoked. Please login again.");
        }

        return refreshToken;
    }

    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepository.findByToken(token).ifPresent(rt -> {
            rt.setRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }

    @Transactional
    public void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllByUser(user);
    }

    @Transactional(readOnly = true)
    public java.util.List<RefreshToken> getAllUserTokens(User user) {
        return refreshTokenRepository.findByUser(user);
    }

    @Transactional
    public void revokeTokenById(Long id, User user) {
        refreshTokenRepository.findById(id).ifPresent(rt -> {
            if (rt.getUser().getId().equals(user.getId())) {
                rt.setRevoked(true);
                refreshTokenRepository.save(rt);
            }
        });
    }

    @Transactional
    public void cleanUpExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens();
        log.info("Cleaned up expired refresh tokens");
    }
}
