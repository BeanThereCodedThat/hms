package com.dms.repository;

import com.dms.entity.Doctor;
import com.dms.enums.DoctorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByDoctorCode(String doctorCode);
    boolean existsByDoctorCode(String doctorCode);
    List<Doctor> findByStatusAndActiveTrue(DoctorStatus status);
    List<Doctor> findByActiveTrue();
}
