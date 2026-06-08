package com.dms.repository;

import com.dms.entity.Notification;
import com.dms.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetRoleAndIsReadFalseOrderByCreatedAtDesc(String targetRole);
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(String targetRole);
    long countByTargetRoleAndIsReadFalse(String targetRole);
    void deleteByTargetRoleAndType(String targetRole, NotificationType type);
}
