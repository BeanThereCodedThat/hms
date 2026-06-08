package com.dms.service;

import com.dms.dto.NotificationDto;
import com.dms.entity.Notification;
import com.dms.enums.NotificationType;
import com.dms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final MedicineRepository medicineRepository;
    private final VaccinationRepository vaccinationRepository;
    private final HealthCheckupRepository checkupRepository;

    public List<NotificationDto> getUnreadForRole(String role) {
        return notificationRepository.findByTargetRoleAndIsReadFalseOrderByCreatedAtDesc(role)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<NotificationDto> getAllForRole(String role) {
        return notificationRepository.findByTargetRoleOrderByCreatedAtDesc(role)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public long getUnreadCount(String role) {
        return notificationRepository.countByTargetRoleAndIsReadFalse(role);
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead(String role) {
        notificationRepository.findByTargetRoleAndIsReadFalseOrderByCreatedAtDesc(role)
                .forEach(n -> {
                    n.setRead(true);
                    n.setReadAt(LocalDateTime.now());
                    notificationRepository.save(n);
                });
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void generateDailyNotifications() {
        log.info("Generating daily notifications...");
        generateMedicineExpiryNotifications();
        generateLowStockNotifications();
        generateVaccinationReminders();
        generateCheckupReminders();
    }

    private void generateMedicineExpiryNotifications() {
        LocalDate today = LocalDate.now();
        LocalDate cutoff = today.plusDays(90);

        notificationRepository.deleteByTargetRoleAndType("PHARMACIST", NotificationType.MEDICINE_EXPIRY);

        medicineRepository.findByExpiryDateBetweenAndActiveTrue(today, cutoff).forEach(m -> {
            Notification n = Notification.builder()
                    .type(NotificationType.MEDICINE_EXPIRY)
                    .title("Medicine Expiring Soon")
                    .message(m.getName() + " (Batch: " + m.getBatchNumber() + ") expires on " + m.getExpiryDate())
                    .targetRole("PHARMACIST")
                    .referenceId(String.valueOf(m.getId()))
                    .referenceType("MEDICINE")
                    .expiresAt(LocalDateTime.now().plusDays(1))
                    .build();
            notificationRepository.save(n);
        });

        medicineRepository.findByExpiryDateBeforeAndActiveTrue(today).forEach(m -> {
            Notification n = Notification.builder()
                    .type(NotificationType.MEDICINE_EXPIRY)
                    .title("Medicine EXPIRED")
                    .message(m.getName() + " has expired! Expiry: " + m.getExpiryDate())
                    .targetRole("PHARMACIST")
                    .referenceId(String.valueOf(m.getId()))
                    .referenceType("MEDICINE")
                    .expiresAt(LocalDateTime.now().plusDays(1))
                    .build();
            notificationRepository.save(n);
        });
    }

    private void generateLowStockNotifications() {
        notificationRepository.deleteByTargetRoleAndType("PHARMACIST", NotificationType.LOW_STOCK);

        medicineRepository.findByStockStatusInAndActiveTrue(
                List.of(com.dms.enums.StockStatus.LOW, com.dms.enums.StockStatus.CRITICAL)).forEach(m -> {
            Notification n = Notification.builder()
                    .type(NotificationType.LOW_STOCK)
                    .title("Low Stock Alert")
                    .message(m.getName() + " has only " + m.getCurrentStock() + " " + m.getUnit() + " remaining")
                    .targetRole("PHARMACIST")
                    .referenceId(String.valueOf(m.getId()))
                    .referenceType("MEDICINE")
                    .expiresAt(LocalDateTime.now().plusDays(1))
                    .build();
            notificationRepository.save(n);
        });
    }

    private void generateVaccinationReminders() {
        LocalDate today = LocalDate.now();
        LocalDate next30 = today.plusDays(30);

        notificationRepository.deleteByTargetRoleAndType("OPD_STAFF", NotificationType.VACCINATION_DUE);

        vaccinationRepository.findByDueDateBetween(today, next30).forEach(v -> {
            if (!v.isCompleted()) {
                Notification n = Notification.builder()
                        .type(NotificationType.VACCINATION_DUE)
                        .title("Vaccination Due")
                        .message(v.getEmployee().getFullName() + " - " + v.getVaccineName() + " due on " + v.getDueDate())
                        .targetRole("OPD_STAFF")
                        .referenceId(String.valueOf(v.getId()))
                        .referenceType("VACCINATION")
                        .expiresAt(LocalDateTime.now().plusDays(1))
                        .build();
                notificationRepository.save(n);
            }
        });
    }

    private void generateCheckupReminders() {
        LocalDate today = LocalDate.now();
        LocalDate next30 = today.plusDays(30);

        notificationRepository.deleteByTargetRoleAndType("OPD_STAFF", NotificationType.CHECKUP_DUE);

        checkupRepository.findByScheduledDateBetween(today, next30).forEach(c -> {
            if (c.getStatus() == com.dms.enums.CheckupStatus.SCHEDULED) {
                Notification n = Notification.builder()
                        .type(NotificationType.CHECKUP_DUE)
                        .title("Health Checkup Due")
                        .message(c.getEmployee().getFullName() + " - " + c.getCheckupType() + " scheduled on " + c.getScheduledDate())
                        .targetRole("OPD_STAFF")
                        .referenceId(String.valueOf(c.getId()))
                        .referenceType("CHECKUP")
                        .expiresAt(LocalDateTime.now().plusDays(1))
                        .build();
                notificationRepository.save(n);
            }
        });
    }

    private NotificationDto toDto(Notification n) {
        NotificationDto dto = new NotificationDto();
        dto.setId(n.getId());
        dto.setType(n.getType());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setTargetRole(n.getTargetRole());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        dto.setReferenceId(n.getReferenceId());
        dto.setReferenceType(n.getReferenceType());
        return dto;
    }
}
