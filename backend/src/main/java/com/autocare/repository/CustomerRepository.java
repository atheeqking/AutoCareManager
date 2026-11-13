package com.autocare.repository;

import com.autocare.entity.Customer;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCustomerId(String customerId);

    Optional<Customer> findByUserId(Long userId);

    java.util.List<Customer>
            findByNameContainingIgnoreCaseOrPhoneContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    String name, String phone, String email);
}
