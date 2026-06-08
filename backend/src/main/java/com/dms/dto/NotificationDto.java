package com.dms.dto;

import com.dms.enums.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationDto {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private String targetRole;
    private boolean read;
    private LocalDateTime createdAt;
    private String referenceId;
    private String referenceType;
}
