package com.dms.repository;

import com.dms.entity.HealthCheckup;
import com.dms.enums.CheckupStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HealthCheckupRepository extends JpaRepository<HealthCheckup, Long> {
    List<HealthCheckup> findByEmployeeIdOrderByScheduledDateDesc(Long employeeId);
    List<HealthCheckup> findByScheduledDateBetween(LocalDate start, LocalDate end);
    List<HealthCheckup> findByStatus(CheckupStatus status);

    @Query("SELECT COUNT(h) FROM HealthCheckup h WHERE h.scheduledDate BETWEEN :start AND :end AND h.status = 'SCHEDULED'")
    long countUpcomingCheckups(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
