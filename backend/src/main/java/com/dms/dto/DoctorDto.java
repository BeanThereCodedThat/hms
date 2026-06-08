package com.dms.dto;

import com.dms.enums.DoctorStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DoctorDto {
    private Long id;
    @NotBlank private String doctorCode;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    private String specialization;
    private String qualification;
    private String registrationNumber;
    private String contactNumber;
    private String email;
    private DoctorStatus status;
    private String currentShift;
    private boolean active;
    private String fullName;
}
