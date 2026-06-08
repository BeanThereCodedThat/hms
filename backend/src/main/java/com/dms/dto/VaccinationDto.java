package com.dms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class VaccinationDto {
    private Long id;
    @NotNull private Long employeeId;
    private String employeeName;
    @NotBlank private String vaccineName;
    private String vaccineType;
    private LocalDate administeredDate;
    private LocalDate dueDate;
    private LocalDate nextDueDate;
    private String batchNumber;
    private String administeredBy;
    private String siteOfInjection;
    private String notes;
    private boolean completed;
    private String doseNumber;
}
