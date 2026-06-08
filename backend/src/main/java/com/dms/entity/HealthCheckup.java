package com.dms.entity;

import com.dms.enums.CheckupStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "health_checkups", indexes = {
        @Index(name = "idx_checkup_emp", columnList = "employee_id"),
        @Index(name = "idx_checkup_date", columnList = "scheduledDate")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HealthCheckup extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, length = 200)
    private String checkupType;

    private LocalDate scheduledDate;

    private LocalDate completedDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private CheckupStatus status = CheckupStatus.SCHEDULED;

    @Column(length = 200)
    private String conductedBy;

    @Column(columnDefinition = "TEXT")
    private String findings;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    private LocalDate nextDueDate;

    @Column(columnDefinition = "TEXT")
    private String remarks;
}
