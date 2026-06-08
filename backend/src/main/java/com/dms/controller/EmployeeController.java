package com.dms.controller;

import com.dms.dto.*;
import com.dms.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<EmployeeDto>>> getAll(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "firstName") String sortBy) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(sortBy));
        return ResponseEntity.ok(ApiResponse.success(employeeService.getAllEmployees(search, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getById(id)));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<EmployeeDto>> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getByCode(code)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPD_STAFF')")
    public ResponseEntity<ApiResponse<EmployeeDto>> create(@Valid @RequestBody EmployeeDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Employee created", employeeService.create(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPD_STAFF')")
    public ResponseEntity<ApiResponse<EmployeeDto>> update(@PathVariable Long id, @Valid @RequestBody EmployeeDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Employee updated", employeeService.update(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        employeeService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deactivated", null));
    }

    // Family Members
    @GetMapping("/{id}/family")
    public ResponseEntity<ApiResponse<List<FamilyMemberDto>>> getFamily(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.getFamilyMembers(id)));
    }

    @PostMapping("/{id}/family")
    @PreAuthorize("hasAnyRole('ADMIN','OPD_STAFF')")
    public ResponseEntity<ApiResponse<FamilyMemberDto>> addFamilyMember(
            @PathVariable Long id, @Valid @RequestBody FamilyMemberDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Family member added", employeeService.addFamilyMember(id, dto)));
    }

    @PutMapping("/family/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPD_STAFF')")
    public ResponseEntity<ApiResponse<FamilyMemberDto>> updateFamilyMember(
            @PathVariable Long memberId, @Valid @RequestBody FamilyMemberDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Family member updated", employeeService.updateFamilyMember(memberId, dto)));
    }

    @DeleteMapping("/family/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN','OPD_STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteFamilyMember(@PathVariable Long memberId) {
        employeeService.deleteFamilyMember(memberId);
        return ResponseEntity.ok(ApiResponse.success("Family member deleted", null));
    }
}
