package com.dms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "first_aid_boxes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FirstAidBox extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String boxCode;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(length = 200)
    private String department;

    @Column(length = 100)
    private String responsiblePerson;

    @Column(nullable = false)
    private boolean active = true;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @OneToMany(mappedBy = "firstAidBox", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<FirstAidBoxItem> items = new ArrayList<>();
}
