package com.autocare.repository;

import com.autocare.entity.ServiceItem;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> {
    List<ServiceItem> findByServiceCase_ServiceCaseId(String serviceCaseId);
}
