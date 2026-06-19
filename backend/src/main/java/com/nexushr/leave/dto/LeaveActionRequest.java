package com.nexushr.leave.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveActionRequest {

    @Size(max = 500, message = "Remarks must not exceed 500 characters")
    private String remarks;
}
