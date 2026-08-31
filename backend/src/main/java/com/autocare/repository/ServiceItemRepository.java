package com.autocare.repository;
import com.autocare.entity.ServiceItem; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface ServiceItemRepository extends JpaRepository<ServiceItem, Long> { List<ServiceItem> findByServiceCase_ServiceCaseId(String serviceCaseId); }
