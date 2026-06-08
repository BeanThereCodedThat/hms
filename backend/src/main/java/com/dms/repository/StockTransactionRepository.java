package com.dms.repository;

import com.dms.entity.StockTransaction;
import com.dms.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    List<StockTransaction> findByMedicineIdOrderByTransactionDateDesc(Long medicineId);
    Page<StockTransaction> findByMedicineId(Long medicineId, Pageable pageable);

    @Query("SELECT s FROM StockTransaction s WHERE s.transactionDate BETWEEN :start AND :end ORDER BY s.transactionDate DESC")
    List<StockTransaction> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT SUM(s.quantity) FROM StockTransaction s WHERE s.medicine.id = :medId AND s.transactionType = :type")
    Long sumQuantityByMedicineAndType(@Param("medId") Long medId, @Param("type") TransactionType type);
}
