package com.nexushr.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Validates critical environment configuration at application startup.
 * Logs warnings for insecure dev-only defaults and provides guidance
 * for production configuration.
 */
@Slf4j
@Component
public class EnvironmentValidator implements ApplicationRunner {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${nexushr.security.encryption.master-key}")
    private String encryptionKey;

    @Value("${app.cors.allowed-origins}")
    private String corsOrigins;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Override
    public void run(ApplicationArguments args) {
        log.info("========================================");
        log.info("  NexusHR Environment Validation");
        log.info("========================================");

        boolean hasWarnings = false;

        // Check JWT secret
        if (jwtSecret.contains("dev-only")) {
            log.warn("⚠️  JWT_SECRET is using the dev-only default! Set JWT_SECRET environment variable for production.");
            log.warn("    Generate with: openssl rand -base64 48");
            hasWarnings = true;
        }

        // Check encryption key
        if (encryptionKey.contains("dev-only")) {
            log.warn("⚠️  ENCRYPTION_MASTER_KEY is using the dev-only default! Set ENCRYPTION_MASTER_KEY environment variable for production.");
            log.warn("    Generate with: openssl rand -hex 16");
            hasWarnings = true;
        }

        // Check CORS origins
        if (corsOrigins != null && !corsOrigins.contains("https://")) {
            log.warn("⚠️  CORS allowed-origins contain no HTTPS domains. Set ALLOWED_ORIGINS for production (e.g., https://your-app.vercel.app).");
            hasWarnings = true;
        }

        // Check datasource
        if (datasourceUrl.contains("localhost") || datasourceUrl.contains("127.0.0.1")) {
            log.info("ℹ️  Database is pointing to localhost (embedded/dev mode). Set SPRING_DATASOURCE_URL for production.");
        }

        if (!hasWarnings) {
            log.info("✅ All critical environment variables are properly configured.");
        } else {
            log.warn("⚠️  Some environment variables are using insecure defaults. See warnings above.");
            log.warn("    Refer to .env.example or DEPLOYMENT.md for guidance.");
        }

        log.info("========================================");
    }
}
