package com.dms.entity;

import com.dms.enums.StockStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "medicines", indexes = {
        @Index(name = "idx_med_name", columnList = "name"),
        @Index(name = "idx_med_code", columnList = "medicineCode")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Medicine extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String medicineCode;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 200)
    private String genericName;

    @Column(length = 100)
    private String category;

    @Column(length = 100)
    private String manufacturer;

    @Column(length = 50)
    private String unit;

    @Column(length = 50)
    private String strength;

    @Column(nullable = false)
    private Integer currentStock = 0;

    @Column(nullable = false)
    private Integer minStockLevel = 10;

    @Column(nullable = false)
    private Integer criticalStockLevel = 5;

    private LocalDate expiryDate;

    @Column(length = 100)
    private String batchNumber;

    @Column(precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(length = 50)
    private String storageLocation;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private StockStatus stockStatus = StockStatus.HEALTHY;

    @Column(nullable = false)
    private boolean active = true;

    @Column(columnDefinition = "TEXT")
    private String description;

    @PrePersist
    @PreUpdate
    public void computeStockStatus() {
        if (expiryDate != null && expiryDate.isBefore(LocalDate.now())) {
            stockStatus = StockStatus.EXPIRED;
        } else if (expiryDate != null && expiryDate.isBefore(LocalDate.now().plusDays(90))) {
            stockStatus = StockStatus.EXPIRING_SOON;
        } else if (currentStock <= criticalStockLevel) {
            stockStatus = StockStatus.CRITICAL;
        } else if (currentStock <= minStockLevel) {
            stockStatus = StockStatus.LOW;
        } else {
            stockStatus = StockStatus.HEALTHY;
        }
    }
}
