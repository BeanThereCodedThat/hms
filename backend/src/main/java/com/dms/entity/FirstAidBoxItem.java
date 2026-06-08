package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "first_aid_box_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FirstAidBoxItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "first_aid_box_id", nullable = false)
    private FirstAidBox firstAidBox;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @Column(nullable = false)
    private Integer currentQuantity = 0;

    @Column(nullable = false)
    private Integer minimumQuantity = 1;

    @Column(columnDefinition = "TEXT")
    private String remarks;
}
