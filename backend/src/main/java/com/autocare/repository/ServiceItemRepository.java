package com.autocare.repository;
import com.autocare.entity.ServiceItem; import org.springframework.data.jpa.repository.JpaRepository;
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> { }
