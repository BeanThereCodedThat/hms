package com.dms.config;

import com.dms.entity.User;
import com.dms.enums.Role;
import com.dms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@RequiredArgsConstructor
@Slf4j
public class AppConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return Optional.of("system");
            }
            return Optional.of(authentication.getName());
        };
    }

    @Bean
    public CommandLineRunner dataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                User admin = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .fullName("System Administrator")
                        .email("admin@dms.com")
                        .role(Role.ADMIN)
                        .active(true)
                        .build();
                userRepository.save(admin);
                log.info("Default admin user created: admin / admin123");
            }

            if (!userRepository.existsByUsername("doctor1")) {
                User doctor = User.builder()
                        .username("doctor1")
                        .password(passwordEncoder.encode("doctor123"))
                        .fullName("Dr. Default Doctor")
                        .email("doctor@dms.com")
                        .role(Role.DOCTOR)
                        .active(true)
                        .build();
                userRepository.save(doctor);
            }

            if (!userRepository.existsByUsername("pharmacist1")) {
                User pharmacist = User.builder()
                        .username("pharmacist1")
                        .password(passwordEncoder.encode("pharma123"))
                        .fullName("Default Pharmacist")
                        .email("pharmacist@dms.com")
                        .role(Role.PHARMACIST)
                        .active(true)
                        .build();
                userRepository.save(pharmacist);
            }

            if (!userRepository.existsByUsername("staff1")) {
                User staff = User.builder()
                        .username("staff1")
                        .password(passwordEncoder.encode("staff123"))
                        .fullName("Default OPD Staff")
                        .email("staff@dms.com")
                        .role(Role.OPD_STAFF)
                        .active(true)
                        .build();
                userRepository.save(staff);
            }

            log.info("Default users initialized");
        };
    }
}
