package com.autocare.security;

import com.autocare.entity.Customer;
import com.autocare.entity.Employee;
import com.autocare.repository.CustomerRepository;
import com.autocare.repository.EmployeeRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
    private final CustomerRepository customers; private final EmployeeRepository employees;
    public CurrentUserService(CustomerRepository customers, EmployeeRepository employees) { this.customers = customers; this.employees = employees; }
    public CurrentUser requireCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CurrentUser current)) throw new AccessDeniedException("Authentication is required");
        return current;
    }
    public Customer requireCurrentCustomer() { CurrentUser current = requireCurrentUser(); if (current.id() == null) throw new AccessDeniedException("Guest users do not own customer records"); return customers.findByUserId(current.id()).orElseThrow(() -> new AccessDeniedException("Customer profile is required")); }
    public Employee requireCurrentEmployee() { return employees.findByUserId(requireCurrentUser().id()).orElseThrow(() -> new AccessDeniedException("Employee profile is required")); }
}
