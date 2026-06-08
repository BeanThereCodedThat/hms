package com.dms.service;

import com.dms.dto.DoctorDto;
import com.dms.entity.Doctor;
import com.dms.enums.DoctorStatus;
import com.dms.exception.ResourceNotFoundException;
import com.dms.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public List<DoctorDto> getAll() {
        return doctorRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<DoctorDto> getAvailable() {
        return doctorRepository.findByStatusAndActiveTrue(DoctorStatus.AVAILABLE)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public DoctorDto getById(Long id) {
        return toDto(findById(id));
    }

    public DoctorDto create(DoctorDto dto) {
        if (doctorRepository.existsByDoctorCode(dto.getDoctorCode())) {
            throw new IllegalArgumentException("Doctor code already exists: " + dto.getDoctorCode());
        }
        Doctor doctor = fromDto(dto);
        return toDto(doctorRepository.save(doctor));
    }

    public DoctorDto update(Long id, DoctorDto dto) {
        Doctor doctor = findById(id);
        doctor.setFirstName(dto.getFirstName());
        doctor.setLastName(dto.getLastName());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setQualification(dto.getQualification());
        doctor.setRegistrationNumber(dto.getRegistrationNumber());
        doctor.setContactNumber(dto.getContactNumber());
        doctor.setEmail(dto.getEmail());
        doctor.setCurrentShift(dto.getCurrentShift());
        if (dto.getStatus() != null) doctor.setStatus(dto.getStatus());
        return toDto(doctorRepository.save(doctor));
    }

    public DoctorDto updateStatus(Long id, DoctorStatus status) {
        Doctor doctor = findById(id);
        doctor.setStatus(status);
        return toDto(doctorRepository.save(doctor));
    }

    private Doctor findById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + id));
    }

    public DoctorDto toDto(Doctor d) {
        DoctorDto dto = new DoctorDto();
        dto.setId(d.getId());
        dto.setDoctorCode(d.getDoctorCode());
        dto.setFirstName(d.getFirstName());
        dto.setLastName(d.getLastName());
        dto.setFullName(d.getFullName());
        dto.setSpecialization(d.getSpecialization());
        dto.setQualification(d.getQualification());
        dto.setRegistrationNumber(d.getRegistrationNumber());
        dto.setContactNumber(d.getContactNumber());
        dto.setEmail(d.getEmail());
        dto.setStatus(d.getStatus());
        dto.setCurrentShift(d.getCurrentShift());
        dto.setActive(d.isActive());
        return dto;
    }

    private Doctor fromDto(DoctorDto dto) {
        return Doctor.builder()
                .doctorCode(dto.getDoctorCode())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .specialization(dto.getSpecialization())
                .qualification(dto.getQualification())
                .registrationNumber(dto.getRegistrationNumber())
                .contactNumber(dto.getContactNumber())
                .email(dto.getEmail())
                .status(dto.getStatus() != null ? dto.getStatus() : DoctorStatus.AVAILABLE)
                .currentShift(dto.getCurrentShift())
                .active(true)
                .build();
    }
}
