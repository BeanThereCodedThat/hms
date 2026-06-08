package com.dms.service;

import com.dms.dto.DashboardDto;
import com.dms.enums.VisitStatus;
import com.dms.enums.VisitType;
import com.dms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final OpdVisitRepository visitRepository;
    private final MedicineRepository medicineRepository;
    private final VaccinationRepository vaccinationRepository;
    private final HealthCheckupRepository checkupRepository;
    private final NotificationRepository notificationRepository;
    private final OpdVisitService visitService;
    private final MedicineService medicineService;
    private final NotificationService notificationService;

    public DashboardDto getDashboard() {
        LocalDate today = LocalDate.now();
        LocalDate nextMonth = today.plusDays(30);

        return DashboardDto.builder()
                .totalEmployees(employeeRepository.countByActiveTrue())
                .todayVisits(visitRepository.countTodayVisits(today))
                .todayFirstAid(visitRepository.countTodayVisitsByType(today, VisitType.FIRST_AID))
                .todayAccidents(visitRepository.countTodayVisitsByType(today, VisitType.MINOR_ACCIDENT))
                .lowStockMedicines(medicineRepository.countLowStockMedicines())
                .expiredMedicines(medicineRepository.countExpiredMedicines(today))
                .expiringMedicines(medicineRepository.countExpiringMedicines(today, today.plusDays(90)))
                .upcomingVaccinations(vaccinationRepository.countUpcomingVaccinations(today, nextMonth))
                .upcomingCheckups(checkupRepository.countUpcomingCheckups(today, nextMonth))
                .recentVisits(visitRepository.findByVisitDate(today, PageRequest.of(0, 10))
                        .getContent().stream().map(visitService::toDto).collect(Collectors.toList()))
                .lowStockList(medicineService.getLowStock())
                .notifications(notificationService.getUnreadForRole("ADMIN"))
                .pendingVisits(visitRepository.countByStatusNotAndVisitDate(VisitStatus.CLOSED, today))
                .build();
    }
}
