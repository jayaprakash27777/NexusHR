package com.nexushr.security;

import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.Collection;

@Component
public class NexusPermissionEvaluator implements PermissionEvaluator {

    @Override
    public boolean hasPermission(Authentication auth, Object targetDomainObject, Object permission) {
        if ((auth == null) || (targetDomainObject == null) || !(permission instanceof String)) {
            return false;
        }
        
        String category = targetDomainObject.toString().toUpperCase();
        String action = permission.toString().toUpperCase();

        return evaluatePermission(auth, category, action);
    }

    @Override
    public boolean hasPermission(Authentication auth, Serializable targetId, String targetType, Object permission) {
        if ((auth == null) || (targetType == null) || !(permission instanceof String)) {
            return false;
        }
        
        String category = targetType.toUpperCase();
        String action = permission.toString().toUpperCase();

        return evaluatePermission(auth, category, action);
    }

    private boolean evaluatePermission(Authentication auth, String category, String action) {
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        
        // Super Admin Override
        if (authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("SYSTEM_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN"))) {
            return true;
        }

        // Read-Only Auditor Mode Check (Deny Modifications if ONLY auditor)
        boolean isAuditor = authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_AUDITOR"));
        if (isAuditor && !authorities.stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SUPER_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"))) {
            if (action.equals("CREATE") || action.equals("UPDATE") || action.equals("DELETE")) {
                return false;
            }
        }

        // Granular Permission Check
        String requiredAuthority = category + ":" + action;
        return authorities.stream().anyMatch(a -> a.getAuthority().equals(requiredAuthority));
    }
}
