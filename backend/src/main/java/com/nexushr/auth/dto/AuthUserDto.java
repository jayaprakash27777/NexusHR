package com.nexushr.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUserDto {
    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String dashboardUrl;
    private String employeeId;
    private String avatar;
}
