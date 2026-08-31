package com.autocare.repository;
import com.autocare.entity.Diagnosis; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface DiagnosisRepository extends JpaRepository<Diagnosis, Long> { Optional<Diagnosis> findFirstByServiceCase_ServiceCaseIdOrderByDiagnosedAtDesc(String serviceCaseId); }
