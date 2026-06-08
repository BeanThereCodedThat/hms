package com.dms.controller;

import com.dms.dto.ApiResponse;
import com.dms.dto.NotificationDto;
import com.dms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications(Authentication auth) {
        String role = extractRole(auth);
        return ResponseEntity.ok(ApiResponse.success(notificationService.getAllForRole(role)));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getUnread(Authentication auth) {
        String role = extractRole(auth);
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadForRole(role)));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication auth) {
        String role = extractRole(auth);
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount(role)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllRead(Authentication auth) {
        String role = extractRole(auth);
        notificationService.markAllAsRead(role);
        return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
    }

    private String extractRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .findFirst()
                .orElse("OPD_STAFF");
    }
}
