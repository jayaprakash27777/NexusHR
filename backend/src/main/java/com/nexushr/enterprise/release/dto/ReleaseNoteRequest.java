package com.nexushr.enterprise.release.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReleaseNoteRequest {

    @NotBlank(message = "Version is required")
    @Size(max = 50)
    private String version;

    @NotBlank(message = "Title is required")
    @Size(max = 500)
    private String title;

    @NotBlank(message = "Release type is required")
    @Pattern(regexp = "^(MAJOR|MINOR|PATCH|HOTFIX|SECURITY)$", message = "Invalid release type")
    private String releaseType;

    private String description;

    private String changes = "[]";

    private boolean published = false;
}
