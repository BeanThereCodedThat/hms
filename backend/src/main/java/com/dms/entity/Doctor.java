package com.dms.entity;

import com.dms.enums.DoctorStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Doctor extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String doctorCode;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(length = 200)
    private String specialization;

    @Column(length = 100)
    private String qualification;

    @Column(length = 100)
    private String registrationNumber;

    @Column(length = 20)
    private String contactNumber;

    @Column(length = 150)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private DoctorStatus status = DoctorStatus.AVAILABLE;

    @Column(length = 50)
    private String currentShift;

    @Column(nullable = false)
    private boolean active = true;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
