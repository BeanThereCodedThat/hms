package com.dms.service;

import com.dms.dto.MedicineDto;
import com.dms.dto.PageResponse;
import com.dms.dto.StockTransactionDto;
import com.dms.entity.Medicine;
import com.dms.entity.StockTransaction;
import com.dms.enums.StockStatus;
import com.dms.enums.TransactionType;
import com.dms.exception.ResourceNotFoundException;
import com.dms.repository.MedicineRepository;
import com.dms.repository.StockTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public PageResponse<MedicineDto> getAll(String search, Pageable pageable) {
        Page<Medicine> page;
        if (search != null && !search.isBlank()) {
            page = medicineRepository.searchMedicines(search, pageable);
        } else {
            page = medicineRepository.findAll(pageable);
        }
        return PageResponse.<MedicineDto>builder()
                .content(page.getContent().stream().map(this::toDto).collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    public List<MedicineDto> getAllActive() {
        return medicineRepository.findByActiveTrueOrderByName()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public MedicineDto getById(Long id) {
        return toDto(findById(id));
    }

    public MedicineDto create(MedicineDto dto) {
        if (medicineRepository.existsByMedicineCode(dto.getMedicineCode())) {
            throw new IllegalArgumentException("Medicine code already exists: " + dto.getMedicineCode());
        }
        Medicine medicine = fromDto(dto);
        medicine.computeStockStatus();
        return toDto(medicineRepository.save(medicine));
    }

    public MedicineDto update(Long id, MedicineDto dto) {
        Medicine medicine = findById(id);
        updateFromDto(medicine, dto);
        medicine.computeStockStatus();
        return toDto(medicineRepository.save(medicine));
    }

    public StockTransactionDto addTransaction(StockTransactionDto dto) {
        Medicine medicine = findById(dto.getMedicineId());
        int qty = dto.getQuantity();

        switch (dto.getTransactionType()) {
            case INWARD -> medicine.setCurrentStock(medicine.getCurrentStock() + qty);
            case ISSUE, DISCARD, FIRST_AID_ISSUE -> {
                if (medicine.getCurrentStock() < qty) {
                    throw new IllegalArgumentException("Insufficient stock. Available: " + medicine.getCurrentStock());
                }
                medicine.setCurrentStock(medicine.getCurrentStock() - qty);
            }
            case ADJUSTMENT -> medicine.setCurrentStock(qty);
        }

        if (dto.getExpiryDate() != null && dto.getTransactionType() == TransactionType.INWARD) {
            medicine.setExpiryDate(dto.getExpiryDate());
        }
        if (dto.getBatchNumber() != null && dto.getTransactionType() == TransactionType.INWARD) {
            medicine.setBatchNumber(dto.getBatchNumber());
        }

        medicine.computeStockStatus();
        medicineRepository.save(medicine);

        StockTransaction tx = StockTransaction.builder()
                .medicine(medicine)
                .transactionType(dto.getTransactionType())
                .quantity(qty)
                .balanceAfter(medicine.getCurrentStock())
                .transactionDate(LocalDateTime.now())
                .batchNumber(dto.getBatchNumber())
                .expiryDate(dto.getExpiryDate())
                .remarks(dto.getRemarks())
                .build();

        return toTxDto(stockTransactionRepository.save(tx));
    }

    public List<StockTransactionDto> getTransactionHistory(Long medicineId) {
        return stockTransactionRepository.findByMedicineIdOrderByTransactionDateDesc(medicineId)
                .stream().map(this::toTxDto).collect(Collectors.toList());
    }

    public List<MedicineDto> getLowStock() {
        return medicineRepository.findByStockStatusInAndActiveTrue(
                List.of(StockStatus.LOW, StockStatus.CRITICAL))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<MedicineDto> getExpiringSoon() {
        LocalDate cutoff = LocalDate.now().plusDays(90);
        return medicineRepository.findByExpiryDateBetweenAndActiveTrue(LocalDate.now(), cutoff)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<MedicineDto> getExpired() {
        return medicineRepository.findByExpiryDateBeforeAndActiveTrue(LocalDate.now())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private Medicine findById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found: " + id));
    }

    public MedicineDto toDto(Medicine m) {
        MedicineDto dto = new MedicineDto();
        dto.setId(m.getId());
        dto.setMedicineCode(m.getMedicineCode());
        dto.setName(m.getName());
        dto.setGenericName(m.getGenericName());
        dto.setCategory(m.getCategory());
        dto.setManufacturer(m.getManufacturer());
        dto.setUnit(m.getUnit());
        dto.setStrength(m.getStrength());
        dto.setCurrentStock(m.getCurrentStock());
        dto.setMinStockLevel(m.getMinStockLevel());
        dto.setCriticalStockLevel(m.getCriticalStockLevel());
        dto.setExpiryDate(m.getExpiryDate());
        dto.setBatchNumber(m.getBatchNumber());
        dto.setUnitPrice(m.getUnitPrice());
        dto.setStorageLocation(m.getStorageLocation());
        dto.setStockStatus(m.getStockStatus());
        dto.setActive(m.isActive());
        dto.setDescription(m.getDescription());
        dto.setStatusColor(getStatusColor(m));
        return dto;
    }

    private String getStatusColor(Medicine m) {
        if (m.getStockStatus() == null) return "green";
        return switch (m.getStockStatus()) {
            case HEALTHY -> "green";
            case LOW, EXPIRING_SOON -> "yellow";
            case CRITICAL, EXPIRED -> "red";
        };
    }

    private Medicine fromDto(MedicineDto dto) {
        return Medicine.builder()
                .medicineCode(dto.getMedicineCode())
                .name(dto.getName())
                .genericName(dto.getGenericName())
                .category(dto.getCategory())
                .manufacturer(dto.getManufacturer())
                .unit(dto.getUnit())
                .strength(dto.getStrength())
                .currentStock(dto.getCurrentStock() != null ? dto.getCurrentStock() : 0)
                .minStockLevel(dto.getMinStockLevel() != null ? dto.getMinStockLevel() : 10)
                .criticalStockLevel(dto.getCriticalStockLevel() != null ? dto.getCriticalStockLevel() : 5)
                .expiryDate(dto.getExpiryDate())
                .batchNumber(dto.getBatchNumber())
                .unitPrice(dto.getUnitPrice())
                .storageLocation(dto.getStorageLocation())
                .active(true)
                .description(dto.getDescription())
                .build();
    }

    private void updateFromDto(Medicine m, MedicineDto dto) {
        m.setName(dto.getName());
        m.setGenericName(dto.getGenericName());
        m.setCategory(dto.getCategory());
        m.setManufacturer(dto.getManufacturer());
        m.setUnit(dto.getUnit());
        m.setStrength(dto.getStrength());
        m.setMinStockLevel(dto.getMinStockLevel() != null ? dto.getMinStockLevel() : m.getMinStockLevel());
        m.setCriticalStockLevel(dto.getCriticalStockLevel() != null ? dto.getCriticalStockLevel() : m.getCriticalStockLevel());
        m.setExpiryDate(dto.getExpiryDate());
        m.setBatchNumber(dto.getBatchNumber());
        m.setUnitPrice(dto.getUnitPrice());
        m.setStorageLocation(dto.getStorageLocation());
        m.setDescription(dto.getDescription());
        if (dto.isActive() != m.isActive()) m.setActive(dto.isActive());
    }

    private StockTransactionDto toTxDto(StockTransaction tx) {
        StockTransactionDto dto = new StockTransactionDto();
        dto.setId(tx.getId());
        dto.setMedicineId(tx.getMedicine().getId());
        dto.setMedicineName(tx.getMedicine().getName());
        dto.setTransactionType(tx.getTransactionType());
        dto.setQuantity(tx.getQuantity());
        dto.setBalanceAfter(tx.getBalanceAfter());
        dto.setTransactionDate(tx.getTransactionDate());
        dto.setBatchNumber(tx.getBatchNumber());
        dto.setExpiryDate(tx.getExpiryDate());
        dto.setRemarks(tx.getRemarks());
        dto.setCreatedBy(tx.getCreatedBy());
        return dto;
    }
}
