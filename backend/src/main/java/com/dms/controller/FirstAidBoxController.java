package com.dms.controller;

import com.dms.dto.ApiResponse;
import com.dms.dto.FirstAidBoxDto;
import com.dms.dto.FirstAidBoxItemDto;
import com.dms.service.FirstAidBoxService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/first-aid-boxes")
@RequiredArgsConstructor
public class FirstAidBoxController {

    private final FirstAidBoxService firstAidBoxService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FirstAidBoxDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(firstAidBoxService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FirstAidBoxDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(firstAidBoxService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FirstAidBoxDto>> create(@Valid @RequestBody FirstAidBoxDto dto) {
        return ResponseEntity.ok(ApiResponse.success("First Aid Box created", firstAidBoxService.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FirstAidBoxDto>> update(@PathVariable Long id, @RequestBody FirstAidBoxDto dto) {
        return ResponseEntity.ok(ApiResponse.success("First Aid Box updated", firstAidBoxService.update(id, dto)));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<ApiResponse<FirstAidBoxItemDto>> addItem(
            @PathVariable Long id, @RequestBody FirstAidBoxItemDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Item added", firstAidBoxService.addItem(id, dto)));
    }

    @PostMapping("/{id}/items/{itemId}/issue")
    public ResponseEntity<ApiResponse<FirstAidBoxItemDto>> issueItem(
            @PathVariable Long id, @PathVariable Long itemId,
            @RequestParam int quantity,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(ApiResponse.success("Item issued", firstAidBoxService.issueItem(id, itemId, quantity, remarks)));
    }
}
