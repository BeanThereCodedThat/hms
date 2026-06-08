package com.dms.service;

import com.dms.dto.*;
import com.dms.entity.*;
import com.dms.enums.TransactionType;
import com.dms.enums.VisitStatus;
import com.dms.enums.VisitType;
import com.dms.exception.ResourceNotFoundException;
import com.dms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OpdVisitService {

    private final OpdVisitRepository visitRepository;
    private final EmployeeRepository employeeRepository;
    private final DoctorRepository doctorRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicineRepository medicineRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final EmployeeService employeeService;

    public OpdVisitDto createVisit(OpdVisitDto dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + dto.getEmployeeId()));

        OpdVisit visit = OpdVisit.builder()
                .visitNumber(generateVisitNumber())
                .employee(employee)
                .visitType(dto.getVisitType() != null ? dto.getVisitType() : VisitType.OPD_CONSULTATION)
                .status(VisitStatus.REGISTERED)
                .visitDate(LocalDate.now())
                .registrationTime(LocalDateTime.now())
                .chiefComplaint(dto.getChiefComplaint())
                .build();

        if (dto.getDoctorId() != null) {
            Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
            visit.setDoctor(doctor);
            visit.setStatus(VisitStatus.IN_CONSULTATION);
            visit.setConsultationTime(LocalDateTime.now());
        }

        return toDto(visitRepository.save(visit));
    }

    public OpdVisitDto updateVisit(Long id, OpdVisitDto dto) {
        OpdVisit visit = findById(id);
        visit.setChiefComplaint(dto.getChiefComplaint());
        visit.setDiagnosis(dto.getDiagnosis());
        visit.setTreatment(dto.getTreatment());
        visit.setRemarks(dto.getRemarks());
        visit.setFollowUpDate(dto.getFollowUpDate());
        visit.setFollowUpInstructions(dto.getFollowUpInstructions());
        visit.setBloodPressure(dto.getBloodPressure());
        visit.setPulse(dto.getPulse());
        visit.setTemperature(dto.getTemperature());
        visit.setWeight(dto.getWeight());
        visit.setHeight(dto.getHeight());
        visit.setSpO2(dto.getSpO2());

        if (dto.getDoctorId() != null) {
            Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
            visit.setDoctor(doctor);
            if (visit.getStatus() == VisitStatus.REGISTERED) {
                visit.setStatus(VisitStatus.IN_CONSULTATION);
                visit.setConsultationTime(LocalDateTime.now());
            }
        }

        return toDto(visitRepository.save(visit));
    }

    public OpdVisitDto addPrescription(Long visitId, PrescriptionDto prescriptionDto) {
        OpdVisit visit = findById(visitId);

        Prescription prescription = prescriptionRepository.findByVisitId(visitId)
                .orElse(new Prescription());
        prescription.setVisit(visit);
        prescription.setPrescribedAt(LocalDateTime.now());
        prescription.setNotes(prescriptionDto.getNotes());

        if (prescriptionDto.getDoctorId() != null) {
            Doctor doctor = doctorRepository.findById(prescriptionDto.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
            prescription.setDoctor(doctor);
        }

        if (prescriptionDto.getItems() != null) {
            prescription.getItems().clear();
            for (PrescriptionItemDto itemDto : prescriptionDto.getItems()) {
                Medicine medicine = medicineRepository.findById(itemDto.getMedicineId())
                        .orElseThrow(() -> new ResourceNotFoundException("Medicine not found: " + itemDto.getMedicineId()));
                PrescriptionItem item = PrescriptionItem.builder()
                        .prescription(prescription)
                        .medicine(medicine)
                        .quantity(itemDto.getQuantity())
                        .dosage(itemDto.getDosage())
                        .frequency(itemDto.getFrequency())
                        .duration(itemDto.getDuration())
                        .instructions(itemDto.getInstructions())
                        .build();
                prescription.getItems().add(item);
            }
        }

        Prescription saved = prescriptionRepository.save(prescription);
        visit.setPrescription(saved);
        visit.setStatus(VisitStatus.PRESCRIPTION_ISSUED);
        visitRepository.save(visit);

        return toDto(visit);
    }

    public OpdVisitDto dispenseMedicines(Long visitId) {
        OpdVisit visit = findById(visitId);
        Prescription prescription = visit.getPrescription();
        if (prescription == null) {
            throw new IllegalArgumentException("No prescription found for this visit");
        }

        for (PrescriptionItem item : prescription.getItems()) {
            Medicine medicine = item.getMedicine();
            if (medicine.getCurrentStock() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for: " + medicine.getName());
            }

            int oldStock = medicine.getCurrentStock();
            medicine.setCurrentStock(oldStock - item.getQuantity());
            medicine.computeStockStatus();
            medicineRepository.save(medicine);

            StockTransaction tx = StockTransaction.builder()
                    .medicine(medicine)
                    .transactionType(TransactionType.ISSUE)
                    .quantity(item.getQuantity())
                    .balanceAfter(medicine.getCurrentStock())
                    .transactionDate(LocalDateTime.now())
                    .remarks("Dispensed for visit: " + visit.getVisitNumber())
                    .visit(visit)
                    .build();
            stockTransactionRepository.save(tx);

            item.setDispensed(true);
            item.setDispensedQuantity(item.getQuantity());
        }

        prescription.setDispensed(true);
        prescription.setDispensedAt(LocalDateTime.now());
        prescriptionRepository.save(prescription);

        visit.setStatus(VisitStatus.MEDICINES_DISPENSED);
        return toDto(visitRepository.save(visit));
    }

    public OpdVisitDto closeVisit(Long visitId) {
        OpdVisit visit = findById(visitId);
        visit.setStatus(VisitStatus.CLOSED);
        visit.setClosedTime(LocalDateTime.now());
        return toDto(visitRepository.save(visit));
    }

    public OpdVisitDto getById(Long id) {
        return toDto(findById(id));
    }

    public List<OpdVisitDto> getTodayVisits() {
        return visitRepository.findByVisitDate(LocalDate.now())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public PageResponse<OpdVisitDto> getVisitsByDate(LocalDate date, Pageable pageable) {
        Page<OpdVisit> page = visitRepository.findByVisitDate(date, pageable);
        return PageResponse.<OpdVisitDto>builder()
                .content(page.getContent().stream().map(this::toDto).collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }

    public List<OpdVisitDto> getEmployeeHistory(Long employeeId) {
        return visitRepository.findByEmployeeIdOrderByVisitDateDesc(employeeId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private OpdVisit findById(Long id) {
        return visitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found: " + id));
    }

    private String generateVisitNumber() {
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = visitRepository.countTodayVisits(LocalDate.now()) + 1;
        return "OPD-" + date + "-" + String.format("%04d", count);
    }

    public OpdVisitDto toDto(OpdVisit v) {
        OpdVisitDto dto = new OpdVisitDto();
        dto.setId(v.getId());
        dto.setVisitNumber(v.getVisitNumber());
        dto.setEmployeeId(v.getEmployee().getId());
        dto.setEmployeeName(v.getEmployee().getFullName());
        dto.setEmployeeCode(v.getEmployee().getEmployeeCode());
        if (v.getDoctor() != null) {
            dto.setDoctorId(v.getDoctor().getId());
            dto.setDoctorName(v.getDoctor().getFullName());
        }
        dto.setVisitType(v.getVisitType());
        dto.setStatus(v.getStatus());
        dto.setVisitDate(v.getVisitDate());
        dto.setRegistrationTime(v.getRegistrationTime());
        dto.setConsultationTime(v.getConsultationTime());
        dto.setClosedTime(v.getClosedTime());
        dto.setChiefComplaint(v.getChiefComplaint());
        dto.setDiagnosis(v.getDiagnosis());
        dto.setTreatment(v.getTreatment());
        dto.setRemarks(v.getRemarks());
        dto.setFollowUpDate(v.getFollowUpDate());
        dto.setFollowUpInstructions(v.getFollowUpInstructions());
        dto.setBloodPressure(v.getBloodPressure());
        dto.setPulse(v.getPulse());
        dto.setTemperature(v.getTemperature());
        dto.setWeight(v.getWeight());
        dto.setHeight(v.getHeight());
        dto.setSpO2(v.getSpO2());
        dto.setCreatedAt(v.getCreatedAt());
        dto.setCreatedBy(v.getCreatedBy());

        if (v.getPrescription() != null) {
            dto.setPrescription(toPrescriptionDto(v.getPrescription()));
        }
        return dto;
    }

    private PrescriptionDto toPrescriptionDto(Prescription p) {
        PrescriptionDto dto = new PrescriptionDto();
        dto.setId(p.getId());
        dto.setVisitId(p.getVisit().getId());
        dto.setPrescribedAt(p.getPrescribedAt());
        dto.setDispensedAt(p.getDispensedAt());
        dto.setNotes(p.getNotes());
        dto.setDispensed(p.isDispensed());
        if (p.getDoctor() != null) {
            dto.setDoctorId(p.getDoctor().getId());
            dto.setDoctorName(p.getDoctor().getFullName());
        }
        if (p.getItems() != null) {
            dto.setItems(p.getItems().stream().map(this::toItemDto).collect(Collectors.toList()));
        }
        return dto;
    }

    private PrescriptionItemDto toItemDto(PrescriptionItem i) {
        PrescriptionItemDto dto = new PrescriptionItemDto();
        dto.setId(i.getId());
        dto.setMedicineId(i.getMedicine().getId());
        dto.setMedicineName(i.getMedicine().getName());
        dto.setMedicineCode(i.getMedicine().getMedicineCode());
        dto.setQuantity(i.getQuantity());
        dto.setDosage(i.getDosage());
        dto.setFrequency(i.getFrequency());
        dto.setDuration(i.getDuration());
        dto.setInstructions(i.getInstructions());
        dto.setDispensed(i.isDispensed());
        dto.setDispensedQuantity(i.getDispensedQuantity());
        return dto;
    }
}
