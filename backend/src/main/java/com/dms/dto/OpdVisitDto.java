package com.dms.dto;

import com.dms.enums.VisitStatus;
import com.dms.enums.VisitType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class OpdVisitDto {
    private Long id;
    private String visitNumber;
    @NotNull private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private Long doctorId;
    private String doctorName;
    private VisitType visitType;
    private VisitStatus status;
    private LocalDate visitDate;
    private LocalDateTime registrationTime;
    private LocalDateTime consultationTime;
    private LocalDateTime closedTime;
    private String chiefComplaint;
    private String diagnosis;
    private String treatment;
    private String remarks;
    private LocalDate followUpDate;
    private String followUpInstructions;
    private String bloodPressure;
    private String pulse;
    private String temperature;
    private String weight;
    private String height;
    private String spO2;
    private PrescriptionDto prescription;
    private LocalDateTime createdAt;
    private String createdBy;
}
