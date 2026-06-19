package com.nexushr.auth.controller;

import com.nexushr.auth.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthorizationController {

    private final AuthorizationService authorizationService;

    @GetMapping("/me/permissions")
    public ResponseEntity<List<String>> getMyPermissions() {
        List<String> permissions = authorizationService.getCurrentUserPermissions();
        return ResponseEntity.ok(permissions);
    }
}
