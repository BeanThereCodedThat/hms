package com.dms.controller;

import com.dms.dto.ApiResponse;
import com.dms.dto.VaccinationDto;
import com.dms.service.VaccinationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vaccinations")
@RequiredArgsConstructor
public class VaccinationController {

    private final VaccinationService vaccinationService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<VaccinationDto>>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationService.getByEmployee(employeeId)));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<VaccinationDto>>> getUpcoming(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationService.getUpcoming(days)));
    }

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<VaccinationDto>>> getOverdue() {
        return ResponseEntity.ok(ApiResponse.success(vaccinationService.getOverdue()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VaccinationDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(vaccinationService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VaccinationDto>> create(@Valid @RequestBody VaccinationDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Vaccination record created", vaccinationService.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VaccinationDto>> update(@PathVariable Long id, @RequestBody VaccinationDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Vaccination updated", vaccinationService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        vaccinationService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Vaccination deleted", null));
    }
}
