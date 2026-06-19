package com.nexushr.security.annotations;

import com.nexushr.auth.model.enums.PermissionCategory;
import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.*;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@PreAuthorize("hasPermission(#category.name(), #action)")
public @interface RequirePermission {
    PermissionCategory category();
    String action();
}
