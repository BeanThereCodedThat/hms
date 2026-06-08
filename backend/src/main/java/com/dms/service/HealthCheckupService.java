package com.dms.service;

import com.dms.dto.HealthCheckupDto;
import com.dms.entity.Employee;
import com.dms.entity.HealthCheckup;
import com.dms.enums.CheckupStatus;
import com.dms.exception.ResourceNotFoundException;
import com.dms.repository.EmployeeRepository;
import com.dms.repository.HealthCheckupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class HealthCheckupService {

    private final HealthCheckupRepository checkupRepository;
    private final EmployeeRepository employeeRepository;

    public List<HealthCheckupDto> getByEmployee(Long employeeId) {
        return checkupRepository.findByEmployeeIdOrderByScheduledDateDesc(employeeId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<HealthCheckupDto> getUpcoming(int days) {
        LocalDate today = LocalDate.now();
        return checkupRepository.findByScheduledDateBetween(today, today.plusDays(days))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<HealthCheckupDto> getByStatus(CheckupStatus status) {
        return checkupRepository.findByStatus(status)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public HealthCheckupDto getById(Long id) {
        return toDto(findById(id));
    }

    public HealthCheckupDto create(HealthCheckupDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + dto.getEmployeeId()));
        HealthCheckup hc = HealthCheckup.builder()
                .employee(employee)
                .checkupType(dto.getCheckupType())
                .scheduledDate(dto.getScheduledDate())
                .completedDate(dto.getCompletedDate())
                .status(dto.getStatus() != null ? dto.getStatus() : CheckupStatus.SCHEDULED)
                .conductedBy(dto.getConductedBy())
                .findings(dto.getFindings())
                .recommendations(dto.getRecommendations())
                .nextDueDate(dto.getNextDueDate())
                .remarks(dto.getRemarks())
                .build();
        return toDto(checkupRepository.save(hc));
    }

    public HealthCheckupDto update(Long id, HealthCheckupDto dto) {
        HealthCheckup hc = findById(id);
        hc.setCheckupType(dto.getCheckupType());
        hc.setScheduledDate(dto.getScheduledDate());
        hc.setCompletedDate(dto.getCompletedDate());
        if (dto.getStatus() != null) hc.setStatus(dto.getStatus());
        hc.setConductedBy(dto.getConductedBy());
        hc.setFindings(dto.getFindings());
        hc.setRecommendations(dto.getRecommendations());
        hc.setNextDueDate(dto.getNextDueDate());
        hc.setRemarks(dto.getRemarks());
        return toDto(checkupRepository.save(hc));
    }

    public void delete(Long id) {
        checkupRepository.deleteById(id);
    }

    private HealthCheckup findById(Long id) {
        return checkupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health checkup not found: " + id));
    }

    public HealthCheckupDto toDto(HealthCheckup hc) {
        HealthCheckupDto dto = new HealthCheckupDto();
        dto.setId(hc.getId());
        dto.setEmployeeId(hc.getEmployee().getId());
        dto.setEmployeeName(hc.getEmployee().getFullName());
        dto.setCheckupType(hc.getCheckupType());
        dto.setScheduledDate(hc.getScheduledDate());
        dto.setCompletedDate(hc.getCompletedDate());
        dto.setStatus(hc.getStatus());
        dto.setConductedBy(hc.getConductedBy());
        dto.setFindings(hc.getFindings());
        dto.setRecommendations(hc.getRecommendations());
        dto.setNextDueDate(hc.getNextDueDate());
        dto.setRemarks(hc.getRemarks());
        return dto;
    }
}
