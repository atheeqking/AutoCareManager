package com.autocare.repository;
import com.autocare.entity.ServiceIssue; import org.springframework.data.jpa.repository.JpaRepository;
public interface ServiceIssueRepository extends JpaRepository<ServiceIssue, Long> { }
