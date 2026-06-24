package com.nexushr.attendance.dto;

import lombok.*;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftDto {
    private UUID id;
    private String name;
    private LocalTime startTime;
    private LocalTime endTime;
    private String description;
}
