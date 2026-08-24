package com.autocare.entity;

import com.autocare.enums.EmployeeRole;
import jakarta.persistence.*;

@Entity @Table(name = "employees", indexes = @Index(name = "idx_employees_employee_id", columnList = "employee_id"))
public class Employee extends AuditableEntity {
    @Column(name = "employee_id", nullable = false, unique = true, length = 20) private String employeeId;
    @Column(nullable = false, length = 150) private String name;
    @Column(nullable = false, length = 30) private String phone;
    @Column(length = 254) private String email;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", unique = true) private User user;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private EmployeeRole role;
    @Column(nullable = false) private boolean active = true;
    protected Employee() { }
}
