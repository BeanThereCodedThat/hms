package com.dms.repository;

import com.dms.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByEmployeeId(Long employeeId);
    List<Document> findByVisitId(Long visitId);
    List<Document> findByVaccinationId(Long vaccinationId);
}
