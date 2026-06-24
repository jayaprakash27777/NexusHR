package com.nexushr.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private UUID userId;
    private String firstName;
    private String lastName;
    private String email;
    private Set<String> roles;
    private AuthUserDto user;
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private long expiresIn;
}
