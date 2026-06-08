package com.dms.entity;

import com.dms.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transactions", indexes = {
        @Index(name = "idx_stock_med", columnList = "medicine_id"),
        @Index(name = "idx_stock_date", columnList = "transactionDate")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StockTransaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType transactionType;

    @Column(nullable = false)
    private Integer quantity;

    private Integer balanceAfter;

    private LocalDateTime transactionDate;

    @Column(length = 100)
    private String batchNumber;

    private LocalDate expiryDate;

    @Column(length = 300)
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    private OpdVisit visit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "first_aid_box_id")
    private FirstAidBox firstAidBox;
}
