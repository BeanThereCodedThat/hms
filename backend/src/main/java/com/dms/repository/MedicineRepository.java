package com.dms.repository;

import com.dms.entity.Medicine;
import com.dms.enums.StockStatus;
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
public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    Optional<Medicine> findByMedicineCode(String medicineCode);
    boolean existsByMedicineCode(String medicineCode);

    @Query("SELECT m FROM Medicine m WHERE m.active = true AND " +
           "(LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.medicineCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Medicine> searchMedicines(@Param("search") String search, Pageable pageable);

    List<Medicine> findByStockStatusInAndActiveTrue(List<StockStatus> statuses);
    List<Medicine> findByExpiryDateBeforeAndActiveTrue(LocalDate date);
    List<Medicine> findByExpiryDateBetweenAndActiveTrue(LocalDate start, LocalDate end);

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.active = true AND m.stockStatus IN ('LOW', 'CRITICAL')")
    long countLowStockMedicines();

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.active = true AND m.expiryDate < :date")
    long countExpiredMedicines(@Param("date") LocalDate date);

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.active = true AND m.expiryDate BETWEEN :start AND :end")
    long countExpiringMedicines(@Param("start") LocalDate start, @Param("end") LocalDate end);

    List<Medicine> findByActiveTrueOrderByName();
}
