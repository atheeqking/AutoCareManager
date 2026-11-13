package com.autocare.repository;

import com.autocare.entity.Diagnosis;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiagnosisRepository extends JpaRepository<Diagnosis, Long> {
    Optional<Diagnosis> findFirstByServiceCase_ServiceCaseIdOrderByDiagnosedAtDesc(
            String serviceCaseId);
}
