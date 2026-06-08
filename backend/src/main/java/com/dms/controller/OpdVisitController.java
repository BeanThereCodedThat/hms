package com.dms.controller;

import com.dms.dto.*;
import com.dms.service.OpdVisitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
public class OpdVisitController {

    private final OpdVisitService visitService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OpdVisitDto>>> getByDate(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "registrationTime"));
        return ResponseEntity.ok(ApiResponse.success(visitService.getVisitsByDate(queryDate, pageable)));
    }

    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<OpdVisitDto>>> getToday() {
        return ResponseEntity.ok(ApiResponse.success(visitService.getTodayVisits()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OpdVisitDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(visitService.getById(id)));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<OpdVisitDto>>> getEmployeeHistory(@PathVariable Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success(visitService.getEmployeeHistory(employeeId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPD_STAFF','DOCTOR')")
    public ResponseEntity<ApiResponse<OpdVisitDto>> create(@Valid @RequestBody OpdVisitDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Visit registered", visitService.createVisit(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPD_STAFF','DOCTOR')")
    public ResponseEntity<ApiResponse<OpdVisitDto>> update(@PathVariable Long id, @RequestBody OpdVisitDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Visit updated", visitService.updateVisit(id, dto)));
    }

    @PostMapping("/{id}/prescription")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<ApiResponse<OpdVisitDto>> addPrescription(
            @PathVariable Long id, @RequestBody PrescriptionDto prescriptionDto) {
        return ResponseEntity.ok(ApiResponse.success("Prescription added", visitService.addPrescription(id, prescriptionDto)));
    }

    @PostMapping("/{id}/dispense")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<ApiResponse<OpdVisitDto>> dispense(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Medicines dispensed", visitService.dispenseMedicines(id)));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN','OPD_STAFF','DOCTOR')")
    public ResponseEntity<ApiResponse<OpdVisitDto>> close(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Visit closed", visitService.closeVisit(id)));
    }
}
