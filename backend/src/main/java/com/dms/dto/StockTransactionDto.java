package com.dms.dto;

import com.dms.enums.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class StockTransactionDto {
    private Long id;
    @NotNull private Long medicineId;
    private String medicineName;
    @NotNull private TransactionType transactionType;
    @NotNull @Min(1) private Integer quantity;
    private Integer balanceAfter;
    private LocalDateTime transactionDate;
    private String batchNumber;
    private LocalDate expiryDate;
    private String remarks;
    private String createdBy;
}
