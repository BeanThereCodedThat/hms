package com.dms.repository;

import com.dms.entity.Vaccination;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {
    List<Vaccination> findByEmployeeIdOrderByDueDateAsc(Long employeeId);
    List<Vaccination> findByDueDateBetween(LocalDate start, LocalDate end);
    List<Vaccination> findByDueDateBeforeAndCompletedFalse(LocalDate date);

    @Query("SELECT COUNT(v) FROM Vaccination v WHERE v.dueDate BETWEEN :start AND :end AND v.completed = false")
    long countUpcomingVaccinations(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
