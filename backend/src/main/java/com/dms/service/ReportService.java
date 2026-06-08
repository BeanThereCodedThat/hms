package com.dms.service;

import com.dms.dto.*;
import com.dms.enums.VisitType;
import com.dms.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final OpdVisitRepository visitRepository;
    private final MedicineRepository medicineRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final VaccinationRepository vaccinationRepository;
    private final HealthCheckupRepository checkupRepository;
    private final OpdVisitService visitService;
    private final MedicineService medicineService;
    private final VaccinationService vaccinationService;
    private final HealthCheckupService checkupService;

    public List<OpdVisitDto> getOpdReport(LocalDate from, LocalDate to) {
        return visitRepository.findByDateRange(from, to)
                .stream().map(visitService::toDto).collect(Collectors.toList());
    }

    public List<OpdVisitDto> getFirstAidReport(LocalDate from, LocalDate to) {
        return visitRepository.findByDateRange(from, to).stream()
                .filter(v -> v.getVisitType() == VisitType.FIRST_AID)
                .map(visitService::toDto).collect(Collectors.toList());
    }

    public List<OpdVisitDto> getAccidentReport(LocalDate from, LocalDate to) {
        return visitRepository.findByDateRange(from, to).stream()
                .filter(v -> v.getVisitType() == VisitType.MINOR_ACCIDENT)
                .map(visitService::toDto).collect(Collectors.toList());
    }

    public List<MedicineDto> getInventoryReport() {
        return medicineRepository.findAll().stream()
                .map(medicineService::toDto).collect(Collectors.toList());
    }

    public List<StockTransactionDto> getStockMovementReport(LocalDate from, LocalDate to) {
        return stockTransactionRepository.findByDateRange(
                from.atStartOfDay(), to.atTime(23, 59, 59))
                .stream().map(tx -> {
                    StockTransactionDto dto = new StockTransactionDto();
                    dto.setId(tx.getId());
                    dto.setMedicineId(tx.getMedicine().getId());
                    dto.setMedicineName(tx.getMedicine().getName());
                    dto.setTransactionType(tx.getTransactionType());
                    dto.setQuantity(tx.getQuantity());
                    dto.setBalanceAfter(tx.getBalanceAfter());
                    dto.setTransactionDate(tx.getTransactionDate());
                    dto.setBatchNumber(tx.getBatchNumber());
                    dto.setRemarks(tx.getRemarks());
                    dto.setCreatedBy(tx.getCreatedBy());
                    return dto;
                }).collect(Collectors.toList());
    }

    public List<MedicineDto> getExpiryReport() {
        return medicineService.getExpiringSoon();
    }

    public List<VaccinationDto> getVaccinationReport(LocalDate from, LocalDate to) {
        return vaccinationRepository.findByDueDateBetween(from, to)
                .stream().map(vaccinationService::toDto).collect(Collectors.toList());
    }

    public List<HealthCheckupDto> getCheckupReport(LocalDate from, LocalDate to) {
        return checkupRepository.findByScheduledDateBetween(from, to)
                .stream().map(checkupService::toDto).collect(Collectors.toList());
    }

    public Map<String, Long> getVisitSummary(LocalDate from, LocalDate to) {
        List<OpdVisitDto> visits = getOpdReport(from, to);
        return visits.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getVisitType() != null ? v.getVisitType().name() : "UNKNOWN",
                        Collectors.counting()
                ));
    }
}
