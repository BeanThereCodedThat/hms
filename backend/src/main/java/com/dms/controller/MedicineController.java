package com.dms.controller;

import com.dms.dto.*;
import com.dms.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MedicineDto>>> getAll(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("name"));
        return ResponseEntity.ok(ApiResponse.success(medicineService.getAll(search, pageable)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<MedicineDto>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success(medicineService.getAllActive()));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<MedicineDto>>> getLowStock() {
        return ResponseEntity.ok(ApiResponse.success(medicineService.getLowStock()));
    }

    @GetMapping("/expiring")
    public ResponseEntity<ApiResponse<List<MedicineDto>>> getExpiring() {
        return ResponseEntity.ok(ApiResponse.success(medicineService.getExpiringSoon()));
    }

    @GetMapping("/expired")
    public ResponseEntity<ApiResponse<List<MedicineDto>>> getExpired() {
        return ResponseEntity.ok(ApiResponse.success(medicineService.getExpired()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(medicineService.getById(id)));
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<ApiResponse<List<StockTransactionDto>>> getTransactions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(medicineService.getTransactionHistory(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<ApiResponse<MedicineDto>> create(@Valid @RequestBody MedicineDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Medicine created", medicineService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<ApiResponse<MedicineDto>> update(@PathVariable Long id, @RequestBody MedicineDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Medicine updated", medicineService.update(id, dto)));
    }

    @PostMapping("/transaction")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<ApiResponse<StockTransactionDto>> addTransaction(@Valid @RequestBody StockTransactionDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Transaction recorded", medicineService.addTransaction(dto)));
    }
}
