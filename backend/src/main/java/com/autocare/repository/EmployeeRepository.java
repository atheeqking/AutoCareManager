package com.autocare.repository;

import com.autocare.entity.Employee;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeId(String employeeId);

    Optional<Employee> findByUserId(Long userId);
}
