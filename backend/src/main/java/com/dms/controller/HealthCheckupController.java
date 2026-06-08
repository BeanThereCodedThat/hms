package com.dms.controller;

import com.dms.dto.ApiResponse;
import com.dms.dto.HealthCheckupDto;
import com.dms.enums.CheckupStatus;
import com.dms.service.HealthCheckupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checkups")
@RequiredArgsConstructor
public class HealthCheckupController {

    private final HealthCheckupService checkupService;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<HealthCheckupDto>>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(ApiResponse.success(checkupService.getByEmployee(employeeId)));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<HealthCheckupDto>>> getUpcoming(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(checkupService.getUpcoming(days)));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<HealthCheckupDto>>> getByStatus(@PathVariable CheckupStatus status) {
        return ResponseEntity.ok(ApiResponse.success(checkupService.getByStatus(status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HealthCheckupDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(checkupService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HealthCheckupDto>> create(@Valid @RequestBody HealthCheckupDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Checkup scheduled", checkupService.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HealthCheckupDto>> update(@PathVariable Long id, @RequestBody HealthCheckupDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Checkup updated", checkupService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        checkupService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Checkup deleted", null));
    }
}
