package com.dms.service;

import com.dms.dto.VaccinationDto;
import com.dms.entity.Employee;
import com.dms.entity.Vaccination;
import com.dms.exception.ResourceNotFoundException;
import com.dms.repository.EmployeeRepository;
import com.dms.repository.VaccinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VaccinationService {

    private final VaccinationRepository vaccinationRepository;
    private final EmployeeRepository employeeRepository;

    public List<VaccinationDto> getByEmployee(Long employeeId) {
        return vaccinationRepository.findByEmployeeIdOrderByDueDateAsc(employeeId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<VaccinationDto> getUpcoming(int days) {
        LocalDate today = LocalDate.now();
        return vaccinationRepository.findByDueDateBetween(today, today.plusDays(days))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<VaccinationDto> getOverdue() {
        return vaccinationRepository.findByDueDateBeforeAndCompletedFalse(LocalDate.now())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public VaccinationDto getById(Long id) {
        return toDto(findById(id));
    }

    public VaccinationDto create(VaccinationDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + dto.getEmployeeId()));
        Vaccination v = Vaccination.builder()
                .employee(employee)
                .vaccineName(dto.getVaccineName())
                .vaccineType(dto.getVaccineType())
                .administeredDate(dto.getAdministeredDate())
                .dueDate(dto.getDueDate())
                .nextDueDate(dto.getNextDueDate())
                .batchNumber(dto.getBatchNumber())
                .administeredBy(dto.getAdministeredBy())
                .siteOfInjection(dto.getSiteOfInjection())
                .notes(dto.getNotes())
                .completed(dto.isCompleted())
                .doseNumber(dto.getDoseNumber())
                .build();
        return toDto(vaccinationRepository.save(v));
    }

    public VaccinationDto update(Long id, VaccinationDto dto) {
        Vaccination v = findById(id);
        v.setVaccineName(dto.getVaccineName());
        v.setVaccineType(dto.getVaccineType());
        v.setAdministeredDate(dto.getAdministeredDate());
        v.setDueDate(dto.getDueDate());
        v.setNextDueDate(dto.getNextDueDate());
        v.setBatchNumber(dto.getBatchNumber());
        v.setAdministeredBy(dto.getAdministeredBy());
        v.setSiteOfInjection(dto.getSiteOfInjection());
        v.setNotes(dto.getNotes());
        v.setCompleted(dto.isCompleted());
        v.setDoseNumber(dto.getDoseNumber());
        return toDto(vaccinationRepository.save(v));
    }

    public void delete(Long id) {
        vaccinationRepository.deleteById(id);
    }

    private Vaccination findById(Long id) {
        return vaccinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccination not found: " + id));
    }

    public VaccinationDto toDto(Vaccination v) {
        VaccinationDto dto = new VaccinationDto();
        dto.setId(v.getId());
        dto.setEmployeeId(v.getEmployee().getId());
        dto.setEmployeeName(v.getEmployee().getFullName());
        dto.setVaccineName(v.getVaccineName());
        dto.setVaccineType(v.getVaccineType());
        dto.setAdministeredDate(v.getAdministeredDate());
        dto.setDueDate(v.getDueDate());
        dto.setNextDueDate(v.getNextDueDate());
        dto.setBatchNumber(v.getBatchNumber());
        dto.setAdministeredBy(v.getAdministeredBy());
        dto.setSiteOfInjection(v.getSiteOfInjection());
        dto.setNotes(v.getNotes());
        dto.setCompleted(v.isCompleted());
        dto.setDoseNumber(v.getDoseNumber());
        return dto;
    }
}
