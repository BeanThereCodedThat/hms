package com.dms.repository;

import com.dms.entity.FirstAidBox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FirstAidBoxRepository extends JpaRepository<FirstAidBox, Long> {
    Optional<FirstAidBox> findByBoxCode(String boxCode);
    List<FirstAidBox> findByActiveTrue();
}
