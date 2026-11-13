package com.autocare.repository;

import com.autocare.entity.ServiceIssue;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceIssueRepository extends JpaRepository<ServiceIssue, Long> {
    List<ServiceIssue> findByServiceCase_ServiceCaseId(String serviceCaseId);
}
