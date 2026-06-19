package com.nexushr.common.tenant;

import java.util.UUID;

public class TenantContextHolder {

    private static final ThreadLocal<UUID> tenantContext = new ThreadLocal<>();

    public static void setTenantId(UUID tenantId) {
        tenantContext.set(tenantId);
    }

    public static UUID getTenantId() {
        return tenantContext.get();
    }

    public static void clear() {
        tenantContext.remove();
    }
}
