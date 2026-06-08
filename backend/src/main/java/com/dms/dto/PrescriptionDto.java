package com.dms.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PrescriptionDto {
    private Long id;
    private Long visitId;
    private Long doctorId;
    private String doctorName;
    private LocalDateTime prescribedAt;
    private LocalDateTime dispensedAt;
    private String notes;
    private boolean dispensed;
    private List<PrescriptionItemDto> items;
}
