package com.dms.dto;

import com.dms.enums.CheckupStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HealthCheckupDto {
    private Long id;
    @NotNull private Long employeeId;
    private String employeeName;
    @NotBlank private String checkupType;
    private LocalDate scheduledDate;
    private LocalDate completedDate;
    private CheckupStatus status;
    private String conductedBy;
    private String findings;
    private String recommendations;
    private LocalDate nextDueDate;
    private String remarks;
}
