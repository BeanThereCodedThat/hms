package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "vaccinations", indexes = {
        @Index(name = "idx_vac_emp", columnList = "employee_id"),
        @Index(name = "idx_vac_due", columnList = "dueDate")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Vaccination extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, length = 200)
    private String vaccineName;

    @Column(length = 100)
    private String vaccineType;

    private LocalDate administeredDate;

    private LocalDate dueDate;

    private LocalDate nextDueDate;

    @Column(length = 100)
    private String batchNumber;

    @Column(length = 100)
    private String administeredBy;

    @Column(length = 200)
    private String siteOfInjection;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private boolean completed = false;

    @Column(length = 50)
    private String doseNumber;
}
