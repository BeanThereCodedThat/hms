package com.dms.controller;

import com.dms.dto.ApiResponse;
import com.dms.dto.DoctorDto;
import com.dms.enums.DoctorStatus;
import com.dms.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAll()));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<DoctorDto>>> getAvailable() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAvailable()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorDto>> create(@Valid @RequestBody DoctorDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Doctor created", doctorService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DoctorDto>> update(@PathVariable Long id, @Valid @RequestBody DoctorDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Doctor updated", doctorService.update(id, dto)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorDto>> updateStatus(
            @PathVariable Long id, @RequestParam DoctorStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", doctorService.updateStatus(id, status)));
    }
}
