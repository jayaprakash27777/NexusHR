package com.nexushr.security.aspect;

import com.nexushr.auth.model.User;
import com.nexushr.auth.repository.UserRepository;
import com.nexushr.common.audit.AuditService;
import com.nexushr.common.tenant.TenantContextHolder;
import com.nexushr.security.annotations.AuditAction;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {

    private final AuditService auditService;
    private final UserRepository userRepository;
    private final ExpressionParser parser = new SpelExpressionParser();

    @AfterReturning(value = "@annotation(auditAction)", returning = "result")
    public void logAuditAction(JoinPoint joinPoint, AuditAction auditAction, Object result) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return;
            }

            User user = userRepository.findByEmail(authentication.getName()).orElse(null);
            if (user == null) {
                return;
            }

            String entityId = null;
            if (!auditAction.entityIdExpression().isEmpty()) {
                entityId = evaluateSpelExpression(joinPoint, auditAction.entityIdExpression());
            }

            auditService.logFull(
                    user.getId(),
                    auditAction.action(),
                    auditAction.entityType(),
                    entityId,
                    "Method executed successfully: " + joinPoint.getSignature().getName(),
                    null, // sourceModule
                    null, // beforeState
                    null, // afterState
                    TenantContextHolder.getTenantId(), // tenantId
                    "INFO"
            );

        } catch (Exception e) {
            log.error("Failed to save audit log for action: {}", auditAction.action(), e);
        }
    }

    private String evaluateSpelExpression(JoinPoint joinPoint, String expression) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Object[] args = joinPoint.getArgs();
        String[] parameterNames = signature.getParameterNames();

        EvaluationContext context = new StandardEvaluationContext();
        for (int i = 0; i < parameterNames.length; i++) {
            context.setVariable(parameterNames[i], args[i]);
        }

        try {
            Object value = parser.parseExpression(expression).getValue(context);
            return value != null ? value.toString() : null;
        } catch (Exception e) {
            log.warn("Failed to evaluate SpEL expression for audit log: {}", expression);
            return null;
        }
    }


}
