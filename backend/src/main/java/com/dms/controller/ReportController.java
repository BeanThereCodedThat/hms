package com.dms.controller;

import com.dms.dto.*;
import com.dms.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/opd")
    public ResponseEntity<ApiResponse<List<OpdVisitDto>>> getOpdReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getOpdReport(from, to)));
    }

    @GetMapping("/first-aid")
    public ResponseEntity<ApiResponse<List<OpdVisitDto>>> getFirstAidReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getFirstAidReport(from, to)));
    }

    @GetMapping("/accidents")
    public ResponseEntity<ApiResponse<List<OpdVisitDto>>> getAccidentReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getAccidentReport(from, to)));
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<List<MedicineDto>>> getInventoryReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getInventoryReport()));
    }

    @GetMapping("/stock-movement")
    public ResponseEntity<ApiResponse<List<StockTransactionDto>>> getStockMovement(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getStockMovementReport(from, to)));
    }

    @GetMapping("/expiry")
    public ResponseEntity<ApiResponse<List<MedicineDto>>> getExpiryReport() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getExpiryReport()));
    }

    @GetMapping("/vaccinations")
    public ResponseEntity<ApiResponse<List<VaccinationDto>>> getVaccinationReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getVaccinationReport(from, to)));
    }

    @GetMapping("/checkups")
    public ResponseEntity<ApiResponse<List<HealthCheckupDto>>> getCheckupReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getCheckupReport(from, to)));
    }

    @GetMapping("/visit-summary")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getVisitSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getVisitSummary(from, to)));
    }
}
