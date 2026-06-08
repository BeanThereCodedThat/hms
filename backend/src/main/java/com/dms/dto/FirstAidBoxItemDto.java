package com.dms.dto;

import lombok.Data;

@Data
public class FirstAidBoxItemDto {
    private Long id;
    private Long firstAidBoxId;
    private Long medicineId;
    private String medicineName;
    private Integer currentQuantity;
    private Integer minimumQuantity;
    private String remarks;
}
