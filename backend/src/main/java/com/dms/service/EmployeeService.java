package com.dms.service;

import com.dms.dto.EmployeeDto;
import com.dms.dto.FamilyMemberDto;
import com.dms.dto.PageResponse;
import com.dms.entity.Employee;
import com.dms.entity.FamilyMember;
import com.dms.exception.ResourceNotFoundException;
import com.dms.repository.EmployeeRepository;
import com.dms.repository.FamilyMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final FamilyMemberRepository familyMemberRepository;

    public PageResponse<EmployeeDto> getAllEmployees(String search, Pageable pageable) {
        Page<Employee> page;
        if (search != null && !search.isBlank()) {
            page = employeeRepository.searchEmployees(search, pageable);
        } else {
            page = employeeRepository.findByActiveTrue(pageable);
        }
        return PageResponse.<EmployeeDto>builder()
                .content(page.getContent().stream().map(this::toDto).collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    public EmployeeDto getById(Long id) {
        return toDto(findById(id));
    }

    public EmployeeDto getByCode(String code) {
        Employee emp = employeeRepository.findByEmployeeCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + code));
        return toDto(emp);
    }

    public EmployeeDto create(EmployeeDto dto) {
        if (employeeRepository.existsByEmployeeCode(dto.getEmployeeCode())) {
            throw new IllegalArgumentException("Employee code already exists: " + dto.getEmployeeCode());
        }
        Employee employee = fromDto(dto);
        employee.setActive(true);
        return toDto(employeeRepository.save(employee));
    }

    public EmployeeDto update(Long id, EmployeeDto dto) {
        Employee employee = findById(id);
        if (!employee.getEmployeeCode().equals(dto.getEmployeeCode()) &&
                employeeRepository.existsByEmployeeCode(dto.getEmployeeCode())) {
            throw new IllegalArgumentException("Employee code already exists");
        }
        updateFromDto(employee, dto);
        return toDto(employeeRepository.save(employee));
    }

    public void deactivate(Long id) {
        Employee employee = findById(id);
        employee.setActive(false);
        employeeRepository.save(employee);
    }

    public List<FamilyMemberDto> getFamilyMembers(Long employeeId) {
        findById(employeeId);
        return familyMemberRepository.findByEmployeeId(employeeId)
                .stream().map(this::toFamilyDto).collect(Collectors.toList());
    }

    public FamilyMemberDto addFamilyMember(Long employeeId, FamilyMemberDto dto) {
        Employee employee = findById(employeeId);
        FamilyMember member = FamilyMember.builder()
                .employee(employee)
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .relation(dto.getRelation())
                .gender(dto.getGender())
                .dateOfBirth(dto.getDateOfBirth())
                .contactNumber(dto.getContactNumber())
                .bloodGroup(dto.getBloodGroup())
                .medicalHistory(dto.getMedicalHistory())
                .allergies(dto.getAllergies())
                .build();
        return toFamilyDto(familyMemberRepository.save(member));
    }

    public FamilyMemberDto updateFamilyMember(Long memberId, FamilyMemberDto dto) {
        FamilyMember member = familyMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Family member not found: " + memberId));
        member.setFirstName(dto.getFirstName());
        member.setLastName(dto.getLastName());
        member.setRelation(dto.getRelation());
        member.setGender(dto.getGender());
        member.setDateOfBirth(dto.getDateOfBirth());
        member.setContactNumber(dto.getContactNumber());
        member.setBloodGroup(dto.getBloodGroup());
        member.setMedicalHistory(dto.getMedicalHistory());
        member.setAllergies(dto.getAllergies());
        return toFamilyDto(familyMemberRepository.save(member));
    }

    public void deleteFamilyMember(Long memberId) {
        familyMemberRepository.deleteById(memberId);
    }

    private Employee findById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + id));
    }

    public EmployeeDto toDto(Employee e) {
        EmployeeDto dto = new EmployeeDto();
        dto.setId(e.getId());
        dto.setEmployeeCode(e.getEmployeeCode());
        dto.setFirstName(e.getFirstName());
        dto.setLastName(e.getLastName());
        dto.setFullName(e.getFullName());
        dto.setGender(e.getGender());
        dto.setDateOfBirth(e.getDateOfBirth());
        dto.setContactNumber(e.getContactNumber());
        dto.setEmail(e.getEmail());
        dto.setAddress(e.getAddress());
        dto.setDepartment(e.getDepartment());
        dto.setDesignation(e.getDesignation());
        dto.setBloodGroup(e.getBloodGroup());
        dto.setSmartCardId(e.getSmartCardId());
        dto.setJoiningDate(e.getJoiningDate());
        dto.setActive(e.isActive());
        dto.setMedicalHistory(e.getMedicalHistory());
        dto.setAllergies(e.getAllergies());
        dto.setChronicConditions(e.getChronicConditions());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setCreatedBy(e.getCreatedBy());
        return dto;
    }

    private Employee fromDto(EmployeeDto dto) {
        return Employee.builder()
                .employeeCode(dto.getEmployeeCode())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .gender(dto.getGender())
                .dateOfBirth(dto.getDateOfBirth())
                .contactNumber(dto.getContactNumber())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .department(dto.getDepartment())
                .designation(dto.getDesignation())
                .bloodGroup(dto.getBloodGroup())
                .smartCardId(dto.getSmartCardId())
                .joiningDate(dto.getJoiningDate())
                .medicalHistory(dto.getMedicalHistory())
                .allergies(dto.getAllergies())
                .chronicConditions(dto.getChronicConditions())
                .build();
    }

    private void updateFromDto(Employee e, EmployeeDto dto) {
        e.setEmployeeCode(dto.getEmployeeCode());
        e.setFirstName(dto.getFirstName());
        e.setLastName(dto.getLastName());
        e.setGender(dto.getGender());
        e.setDateOfBirth(dto.getDateOfBirth());
        e.setContactNumber(dto.getContactNumber());
        e.setEmail(dto.getEmail());
        e.setAddress(dto.getAddress());
        e.setDepartment(dto.getDepartment());
        e.setDesignation(dto.getDesignation());
        e.setBloodGroup(dto.getBloodGroup());
        e.setSmartCardId(dto.getSmartCardId());
        e.setJoiningDate(dto.getJoiningDate());
        e.setMedicalHistory(dto.getMedicalHistory());
        e.setAllergies(dto.getAllergies());
        e.setChronicConditions(dto.getChronicConditions());
    }

    private FamilyMemberDto toFamilyDto(FamilyMember m) {
        FamilyMemberDto dto = new FamilyMemberDto();
        dto.setId(m.getId());
        dto.setEmployeeId(m.getEmployee().getId());
        dto.setFirstName(m.getFirstName());
        dto.setLastName(m.getLastName());
        dto.setRelation(m.getRelation());
        dto.setGender(m.getGender());
        dto.setDateOfBirth(m.getDateOfBirth());
        dto.setContactNumber(m.getContactNumber());
        dto.setBloodGroup(m.getBloodGroup());
        dto.setMedicalHistory(m.getMedicalHistory());
        dto.setAllergies(m.getAllergies());
        return dto;
    }
}
