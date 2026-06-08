package com.dms.dto;

import lombok.Data;

@Data
public class PrescriptionItemDto {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private Integer quantity;
    private String dosage;
    private String frequency;
    private String duration;
    private String instructions;
    private boolean dispensed;
    private Integer dispensedQuantity;
}
