package com.dms.entity;

import com.dms.enums.VisitStatus;
import com.dms.enums.VisitType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "opd_visits", indexes = {
        @Index(name = "idx_visit_date", columnList = "visitDate"),
        @Index(name = "idx_visit_emp", columnList = "employee_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OpdVisit extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String visitNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private VisitType visitType = VisitType.OPD_CONSULTATION;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private VisitStatus status = VisitStatus.REGISTERED;

    @Column(nullable = false)
    private LocalDate visitDate;

    private LocalDateTime registrationTime;
    private LocalDateTime consultationTime;
    private LocalDateTime closedTime;

    @Column(columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String treatment;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    private LocalDate followUpDate;

    @Column(columnDefinition = "TEXT")
    private String followUpInstructions;

    // Vital signs
    private String bloodPressure;
    private String pulse;
    private String temperature;
    private String weight;
    private String height;
    private String spO2;

    @OneToOne(mappedBy = "visit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Prescription prescription;

    @OneToMany(mappedBy = "visit", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Document> documents = new ArrayList<>();
}
