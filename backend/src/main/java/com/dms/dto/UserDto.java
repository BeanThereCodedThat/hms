package com.dms.dto;

import com.dms.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    @NotBlank private String username;
    private String password;
    @NotBlank private String fullName;
    private String email;
    @NotNull private Role role;
    private boolean active;
}
