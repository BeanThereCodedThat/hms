package com.dms.dto;

import com.dms.enums.DocumentType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentDto {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private DocumentType documentType;
    private LocalDateTime uploadedAt;
    private String uploadedBy;
    private Long employeeId;
    private Long visitId;
    private Long vaccinationId;
}
