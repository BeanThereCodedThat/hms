package com.dms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class FirstAidBoxDto {
    private Long id;
    @NotBlank private String boxCode;
    @NotBlank private String location;
    private String department;
    private String responsiblePerson;
    private boolean active;
    private String remarks;
    private List<FirstAidBoxItemDto> items;
}
