package com.dms.dto;

import com.dms.enums.BloodGroup;
import com.dms.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class EmployeeDto {
    private Long id;
    @NotBlank private String employeeCode;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String contactNumber;
    private String email;
    private String address;
    private String department;
    private String designation;
    private BloodGroup bloodGroup;
    private String smartCardId;
    private LocalDate joiningDate;
    private boolean active;
    private String medicalHistory;
    private String allergies;
    private String chronicConditions;
    private String fullName;
    private LocalDateTime createdAt;
    private String createdBy;
}
