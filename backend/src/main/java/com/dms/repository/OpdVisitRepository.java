package com.dms.repository;

import com.dms.entity.OpdVisit;
import com.dms.enums.VisitStatus;
import com.dms.enums.VisitType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OpdVisitRepository extends JpaRepository<OpdVisit, Long> {
    Optional<OpdVisit> findByVisitNumber(String visitNumber);
    List<OpdVisit> findByEmployeeIdOrderByVisitDateDesc(Long employeeId);
    List<OpdVisit> findByVisitDate(LocalDate date);
    List<OpdVisit> findByVisitDateAndVisitType(LocalDate date, VisitType type);
    Page<OpdVisit> findByVisitDate(LocalDate date, Pageable pageable);

    @Query("SELECT COUNT(v) FROM OpdVisit v WHERE v.visitDate = :date")
    long countTodayVisits(@Param("date") LocalDate date);

    @Query("SELECT COUNT(v) FROM OpdVisit v WHERE v.visitDate = :date AND v.visitType = :type")
    long countTodayVisitsByType(@Param("date") LocalDate date, @Param("type") VisitType type);

    @Query("SELECT v FROM OpdVisit v WHERE v.visitDate BETWEEN :start AND :end ORDER BY v.visitDate DESC")
    List<OpdVisit> findByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT v FROM OpdVisit v WHERE v.employee.id = :empId ORDER BY v.visitDate DESC")
    Page<OpdVisit> findByEmployeeId(@Param("empId") Long empId, Pageable pageable);

    long countByStatusNotAndVisitDate(VisitStatus status, LocalDate date);
}
