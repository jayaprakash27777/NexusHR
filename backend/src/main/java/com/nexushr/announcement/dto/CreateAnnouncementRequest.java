package com.nexushr.announcement.dto;

import com.nexushr.announcement.model.AnnouncementType;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class CreateAnnouncementRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String content;

    @NotNull
    private AnnouncementType type;
}
