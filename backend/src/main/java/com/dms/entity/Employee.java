package com.dms.entity;

import com.dms.enums.BloodGroup;
import com.dms.enums.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employees", indexes = {
        @Index(name = "idx_emp_code", columnList = "employeeCode"),
        @Index(name = "idx_emp_name", columnList = "firstName,lastName")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Employee extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String employeeCode;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    private LocalDate dateOfBirth;

    @Column(length = 20)
    private String contactNumber;

    @Column(length = 150)
    private String email;

    @Column(length = 300)
    private String address;

    @Column(length = 100)
    private String department;

    @Column(length = 100)
    private String designation;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private BloodGroup bloodGroup;

    @Column(length = 50)
    private String smartCardId;

    private LocalDate joiningDate;

    @Column(nullable = false)
    private boolean active = true;

    @Column(columnDefinition = "TEXT")
    private String medicalHistory;

    @Column(columnDefinition = "TEXT")
    private String allergies;

    @Column(columnDefinition = "TEXT")
    private String chronicConditions;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<FamilyMember> familyMembers = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OpdVisit> visits = new ArrayList<>();

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
