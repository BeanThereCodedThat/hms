package com.dms.service;

import com.dms.dto.DocumentDto;
import com.dms.entity.Document;
import com.dms.entity.Employee;
import com.dms.entity.OpdVisit;
import com.dms.entity.Vaccination;
import com.dms.enums.DocumentType;
import com.dms.exception.ResourceNotFoundException;
import com.dms.repository.DocumentRepository;
import com.dms.repository.EmployeeRepository;
import com.dms.repository.OpdVisitRepository;
import com.dms.repository.VaccinationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final EmployeeRepository employeeRepository;
    private final OpdVisitRepository visitRepository;
    private final VaccinationRepository vaccinationRepository;

    @Value("${dms.upload.dir}")
    private String uploadDir;

    private static final List<String> ALLOWED_TYPES = List.of(
            "application/pdf", "image/jpeg", "image/jpg", "image/png"
    );

    public DocumentDto upload(MultipartFile file, DocumentType documentType,
                               Long employeeId, Long visitId, Long vaccinationId) throws IOException {
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("File type not allowed. Supported: PDF, JPG, PNG");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        String originalName = file.getOriginalFilename();
        String extension = originalName != null && originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.')) : "";
        String storedName = UUID.randomUUID() + extension;

        Path targetPath = uploadPath.resolve(storedName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        String uploader = SecurityContextHolder.getContext().getAuthentication().getName();

        Document doc = Document.builder()
                .fileName(originalName)
                .storedFileName(storedName)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .filePath(targetPath.toString())
                .documentType(documentType)
                .uploadedAt(LocalDateTime.now())
                .uploadedBy(uploader)
                .build();

        if (employeeId != null) {
            Employee emp = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
            doc.setEmployee(emp);
        }
        if (visitId != null) {
            OpdVisit visit = visitRepository.findById(visitId)
                    .orElseThrow(() -> new ResourceNotFoundException("Visit not found"));
            doc.setVisit(visit);
        }
        if (vaccinationId != null) {
            Vaccination vac = vaccinationRepository.findById(vaccinationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Vaccination not found"));
            doc.setVaccination(vac);
        }

        return toDto(documentRepository.save(doc));
    }

    public Resource download(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        try {
            Path filePath = Paths.get(doc.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) throw new ResourceNotFoundException("File not found on disk");
            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error loading file", e);
        }
    }

    public Document getDocumentEntity(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
    }

    public List<DocumentDto> getByEmployee(Long employeeId) {
        return documentRepository.findByEmployeeId(employeeId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<DocumentDto> getByVisit(Long visitId) {
        return documentRepository.findByVisitId(visitId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public void delete(Long id) throws IOException {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        Files.deleteIfExists(Paths.get(doc.getFilePath()));
        documentRepository.delete(doc);
    }

    private DocumentDto toDto(Document d) {
        DocumentDto dto = new DocumentDto();
        dto.setId(d.getId());
        dto.setFileName(d.getFileName());
        dto.setFileType(d.getFileType());
        dto.setFileSize(d.getFileSize());
        dto.setDocumentType(d.getDocumentType());
        dto.setUploadedAt(d.getUploadedAt());
        dto.setUploadedBy(d.getUploadedBy());
        if (d.getEmployee() != null) dto.setEmployeeId(d.getEmployee().getId());
        if (d.getVisit() != null) dto.setVisitId(d.getVisit().getId());
        if (d.getVaccination() != null) dto.setVaccinationId(d.getVaccination().getId());
        return dto;
    }
}
