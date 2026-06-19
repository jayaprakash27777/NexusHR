package com.nexushr.config;

import com.nexushr.common.tenant.TenantContextHolder;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class TenantFilter extends OncePerRequestFilter {

    private static final String TENANT_HEADER = "X-Tenant-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String tenantIdStr = request.getHeader(TENANT_HEADER);

        if (tenantIdStr != null && !tenantIdStr.trim().isEmpty()) {
            try {
                UUID tenantId = UUID.fromString(tenantIdStr);
                TenantContextHolder.setTenantId(tenantId);
                log.trace("Set tenant context to: {}", tenantId);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid tenant ID format provided in header: {}", tenantIdStr);
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            TenantContextHolder.clear();
        }
    }
}
