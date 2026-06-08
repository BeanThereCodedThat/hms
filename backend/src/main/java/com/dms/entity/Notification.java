package com.dms.entity;

import com.dms.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notif_user", columnList = "targetRole"),
        @Index(name = "idx_notif_read", columnList = "isRead")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private NotificationType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(length = 20)
    private String targetRole;

    private boolean isRead = false;

    private LocalDateTime readAt;

    @Column(length = 50)
    private String referenceId;

    @Column(length = 50)
    private String referenceType;

    private LocalDateTime expiresAt;
}
