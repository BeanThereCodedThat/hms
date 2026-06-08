package com.dms.dto;

import com.dms.enums.StockStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MedicineDto {
    private Long id;
    @NotBlank private String medicineCode;
    @NotBlank private String name;
    private String genericName;
    private String category;
    private String manufacturer;
    private String unit;
    private String strength;
    private Integer currentStock;
    @Min(0) private Integer minStockLevel;
    @Min(0) private Integer criticalStockLevel;
    private LocalDate expiryDate;
    private String batchNumber;
    private BigDecimal unitPrice;
    private String storageLocation;
    private StockStatus stockStatus;
    private boolean active;
    private String description;
    private String statusColor;
}
