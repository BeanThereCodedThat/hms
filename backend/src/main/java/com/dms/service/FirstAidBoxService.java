package com.dms.service;

import com.dms.dto.FirstAidBoxDto;
import com.dms.dto.FirstAidBoxItemDto;
import com.dms.entity.FirstAidBox;
import com.dms.entity.FirstAidBoxItem;
import com.dms.entity.Medicine;
import com.dms.entity.StockTransaction;
import com.dms.enums.TransactionType;
import com.dms.exception.ResourceNotFoundException;
import com.dms.repository.FirstAidBoxRepository;
import com.dms.repository.MedicineRepository;
import com.dms.repository.StockTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FirstAidBoxService {

    private final FirstAidBoxRepository firstAidBoxRepository;
    private final MedicineRepository medicineRepository;
    private final StockTransactionRepository stockTransactionRepository;

    public List<FirstAidBoxDto> getAll() {
        return firstAidBoxRepository.findByActiveTrue()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public FirstAidBoxDto getById(Long id) {
        return toDto(findById(id));
    }

    public FirstAidBoxDto create(FirstAidBoxDto dto) {
        if (firstAidBoxRepository.findByBoxCode(dto.getBoxCode()).isPresent()) {
            throw new IllegalArgumentException("Box code already exists: " + dto.getBoxCode());
        }
        FirstAidBox box = FirstAidBox.builder()
                .boxCode(dto.getBoxCode())
                .location(dto.getLocation())
                .department(dto.getDepartment())
                .responsiblePerson(dto.getResponsiblePerson())
                .active(true)
                .remarks(dto.getRemarks())
                .build();
        return toDto(firstAidBoxRepository.save(box));
    }

    public FirstAidBoxDto update(Long id, FirstAidBoxDto dto) {
        FirstAidBox box = findById(id);
        box.setLocation(dto.getLocation());
        box.setDepartment(dto.getDepartment());
        box.setResponsiblePerson(dto.getResponsiblePerson());
        box.setRemarks(dto.getRemarks());
        return toDto(firstAidBoxRepository.save(box));
    }

    public FirstAidBoxItemDto addItem(Long boxId, FirstAidBoxItemDto dto) {
        FirstAidBox box = findById(boxId);
        Medicine medicine = medicineRepository.findById(dto.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found"));

        FirstAidBoxItem item = box.getItems().stream()
                .filter(i -> i.getMedicine().getId().equals(dto.getMedicineId()))
                .findFirst()
                .orElse(null);

        if (item == null) {
            item = FirstAidBoxItem.builder()
                    .firstAidBox(box)
                    .medicine(medicine)
                    .currentQuantity(dto.getCurrentQuantity())
                    .minimumQuantity(dto.getMinimumQuantity() != null ? dto.getMinimumQuantity() : 1)
                    .remarks(dto.getRemarks())
                    .build();
            box.getItems().add(item);
        } else {
            item.setCurrentQuantity(item.getCurrentQuantity() + dto.getCurrentQuantity());
        }

        // Deduct from main inventory
        if (medicine.getCurrentStock() < dto.getCurrentQuantity()) {
            throw new IllegalArgumentException("Insufficient stock in main inventory");
        }
        medicine.setCurrentStock(medicine.getCurrentStock() - dto.getCurrentQuantity());
        medicine.computeStockStatus();
        medicineRepository.save(medicine);

        StockTransaction tx = StockTransaction.builder()
                .medicine(medicine)
                .transactionType(TransactionType.FIRST_AID_ISSUE)
                .quantity(dto.getCurrentQuantity())
                .balanceAfter(medicine.getCurrentStock())
                .transactionDate(LocalDateTime.now())
                .remarks("Issued to First Aid Box: " + box.getBoxCode())
                .firstAidBox(box)
                .build();
        stockTransactionRepository.save(tx);

        firstAidBoxRepository.save(box);
        return toItemDto(item);
    }

    public FirstAidBoxItemDto issueItem(Long boxId, Long itemId, int quantity, String remarks) {
        FirstAidBox box = findById(boxId);
        FirstAidBoxItem item = box.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in box"));

        if (item.getCurrentQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient quantity in first aid box");
        }
        item.setCurrentQuantity(item.getCurrentQuantity() - quantity);
        firstAidBoxRepository.save(box);
        return toItemDto(item);
    }

    private FirstAidBox findById(Long id) {
        return firstAidBoxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("First Aid Box not found: " + id));
    }

    public FirstAidBoxDto toDto(FirstAidBox b) {
        FirstAidBoxDto dto = new FirstAidBoxDto();
        dto.setId(b.getId());
        dto.setBoxCode(b.getBoxCode());
        dto.setLocation(b.getLocation());
        dto.setDepartment(b.getDepartment());
        dto.setResponsiblePerson(b.getResponsiblePerson());
        dto.setActive(b.isActive());
        dto.setRemarks(b.getRemarks());
        dto.setItems(b.getItems().stream().map(this::toItemDto).collect(Collectors.toList()));
        return dto;
    }

    private FirstAidBoxItemDto toItemDto(FirstAidBoxItem i) {
        FirstAidBoxItemDto dto = new FirstAidBoxItemDto();
        dto.setId(i.getId());
        dto.setFirstAidBoxId(i.getFirstAidBox().getId());
        dto.setMedicineId(i.getMedicine().getId());
        dto.setMedicineName(i.getMedicine().getName());
        dto.setCurrentQuantity(i.getCurrentQuantity());
        dto.setMinimumQuantity(i.getMinimumQuantity());
        dto.setRemarks(i.getRemarks());
        return dto;
    }
}
