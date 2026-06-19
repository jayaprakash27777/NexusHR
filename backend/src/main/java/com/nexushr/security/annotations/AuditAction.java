package com.nexushr.security.annotations;

import java.lang.annotation.*;

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface AuditAction {
    String action();
    String entityType();
    
    /**
     * Optional SpEL expression to evaluate the entity ID from method arguments.
     * Example: "#request.id" or "#employeeId"
     */
    String entityIdExpression() default "";
}
