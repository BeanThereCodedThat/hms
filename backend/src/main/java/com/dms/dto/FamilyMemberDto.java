package com.dms.dto;

import com.dms.enums.BloodGroup;
import com.dms.enums.Gender;
import com.dms.enums.RelationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FamilyMemberDto {
    private Long id;
    private Long employeeId;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotNull private RelationType relation;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String contactNumber;
    private BloodGroup bloodGroup;
    private String medicalHistory;
    private String allergies;
}
