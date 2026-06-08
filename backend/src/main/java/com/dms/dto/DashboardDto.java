package com.dms.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class DashboardDto {
    private long totalEmployees;
    private long todayVisits;
    private long todayFirstAid;
    private long todayAccidents;
    private long lowStockMedicines;
    private long expiringMedicines;
    private long expiredMedicines;
    private long upcomingVaccinations;
    private long upcomingCheckups;
    private long pendingVisits;
    private List<OpdVisitDto> recentVisits;
    private List<MedicineDto> lowStockList;
    private List<NotificationDto> notifications;
}
